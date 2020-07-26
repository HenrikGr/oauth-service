/**
 * @prettier
 *
 * @description
 * The authorization code grant type is used to obtain both access
 * tokens and refresh tokens and is optimized for confidential clients.
 * Since this is a redirection-based flow, the client must be capable of
 * interacting with the resource owner's user-agent (typically a web
 * browser) and capable of receiving incoming requests (via redirection)
 * from the authorization server.
 *
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const debugService = require('@hgc-ab/debug-service')('authorizationCodeGrant')
const AbstractGrant = require('../abstract-grant')
const {
  InvalidArgumentError,
  InvalidGrantError,
  InvalidRequestError,
  ServerError,
} = require('../../errors')
const is = require('../../validator/is')
const TokenModel = require('../../models/token')
const { BearerToken } = require('../../models')
const AccessTokenRequest = require('./access-token-request')

/**
 * Implement authorization code grant
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-4.1
 */
class AuthorizationCodeGrant extends AbstractGrant {
  /**
   * Create a new authorization code grant instance
   *
   * @param {Object|*} model - The data access model
   * @param {Function} model.getAuthorizationCode - Get authorization code
   * @param {Function} model.revokeAuthorizationCode - Revoke authorization code
   * @param {Function} model.saveToken - Save a new token
   * @param {Object} options - Optional settings
   * @param {Number} options.accessTokenLifetime
   * @param {Number} options.refreshTokenLifetime
   * @param {Boolean} options.alwaysIssueNewRefreshToken
   * @param {Boolean} options.allowExtendedTokenAttributes
   * @throws {InvalidArgumentError}
   */
  constructor(
    model,
    options = {
      accessTokenLifetime: 1800,
      refreshTokenLifetime: 86400,
      alwaysIssueNewRefreshToken: true,
      allowExtendedTokenAttributes: false,
    }
  ) {
    super(model, options)

    if (!model) {
      throw new InvalidArgumentError('Missing parameter: `model`')
    }

    if (!model.getAuthorizationCode) {
      throw new InvalidArgumentError(
        'Invalid argument: model does not implement `getAuthorizationCode()`'
      )
    }

    if (!model.revokeAuthorizationCode) {
      throw new InvalidArgumentError(
        'Invalid argument: model does not implement `revokeAuthorizationCode()`'
      )
    }

    if (!model.saveToken) {
      throw new InvalidArgumentError('Invalid argument: model does not implement `saveToken()`')
    }
  }

  /**
   * Validate the requested authorization code
   *
   * @param {AccessTokenRequest} accessTokenRequest - The access token request
   * @param {Object} client - The authenticated client object
   * @returns {Promise<Object>}
   * @throws {InvalidGrantError|ServerError}
   */
  async validateAuthorizationCode(accessTokenRequest, client) {
    debugService('validateAuthorizationCode: ', accessTokenRequest.code)
    const now = new Date()
    const code = await this.model.getAuthorizationCode(accessTokenRequest.code)
    if (!code) {
      throw new InvalidGrantError('Invalid grant: authorization code is invalid')
    }

    if (!code.client) {
      throw new ServerError(
        'Server error: `getAuthorizationCode()` did not return a `client` object'
      )
    }

    if (!code.user) {
      throw new ServerError('Server error: `getAuthorizationCode()` did not return a `user` object')
    }

    if (code.client.id !== client.id) {
      throw new InvalidGrantError('Invalid grant: authorization code is invalid')
    }

    if (!(code.expiresAt instanceof Date)) {
      throw new ServerError('Server error: `expiresAt` must be a Date instance')
    }

    if (code.expiresAt.getTime() < now.getTime()) {
      throw new InvalidGrantError('Invalid grant: authorization code has expired')
    }

    if (code.redirectUri && !is.uri(code.redirectUri)) {
      throw new InvalidGrantError('Invalid grant: `redirect_uri` is not a valid URI')
    }

    return code
  }

  /**
   * Validate the redirect URI.
   *
   * "The authorization server MUST ensure that the redirect_uri parameter is
   * present if the redirect_uri parameter was included in the initial
   * authorization request as described in Section 4.1.1, and if included
   * ensure that their values are identical."
   *
   * @param {Object} code
   * @param {AccessTokenRequest} accessTokenRequest
   * @see https://tools.ietf.org/html/rfc6749#section-4.1.3
   */
  validateRedirectUri(code, accessTokenRequest) {
    debugService('validateRedirectUri: ', accessTokenRequest.redirectUri)
    if (!code.redirectUri) {
      return
    }

    if (accessTokenRequest.redirectUri !== code.redirectUri) {
      throw new InvalidRequestError('Invalid request: `redirect_uri` is invalid')
    }
  }

  /**
   * Revoke the authorization code.
   *
   * The authorization code MUST expire shortly after it is issued to mitigate
   * the risk of leaks. [...] If an authorization code is used more than once,
   * the authorization server MUST deny the request.
   *
   * @param code
   * @see https://tools.ietf.org/html/rfc6749#section-4.1.2
   */
  async deleteAuthorizationCode(code) {
    debugService('deleteAuthorizationCode: ', code.code)
    const status = await this.model.revokeAuthorizationCode(code)
    if (!status) {
      throw new InvalidGrantError('Invalid grant: authorization code is invalid')
    }
  }

  /**
   * Create a new token
   *
   * @param {Object} client - The authenticated client
   * @param {Object} code - The authorization code
   * @returns {Promise<Object>}
   */
  async createToken(client, code) {
    debugService('createToken: ', code)
    const { user, scope } = code
    const accessScope = await super.validateScope(client, user, scope)
    const accessToken = await super.generateAccessToken(client, user, scope)
    const refreshToken = await super.generateRefreshToken(client, user, scope)
    const accessTokenExpiresAt = super.setAccessTokenExpiresAt()
    const refreshTokenExpiresAt = super.setRefreshTokenExpiresAt()

    const token = {
      accessToken,
      accessTokenExpiresAt,
      refreshToken,
      refreshTokenExpiresAt,
      scope: accessScope,
    }

    return this.model.saveToken(client, user, token)
  }

  /**
   * Process authorization code grant
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @param {Object} client - The authenticated client object
   * @returns {Promise<*>}
   * @see https://tools.ietf.org/html/rfc6749#section-4.1.3
   */
  async execute(request, response, client) {
    try {

      debugService('execute: started')

      /**
       * Validate request parameters
       * @type {AccessTokenRequest}
       */
      const accessTokenRequest = new AccessTokenRequest(request, client)

      /**
       * Validate the authorization code
       * @type {Object}
       */
      const code = await this.validateAuthorizationCode(accessTokenRequest, client)
      debugService('execute: ', code)
      /**
       * Validate redirect uri
       */
      this.validateRedirectUri(code, accessTokenRequest)

      /**
       * Delete authorization code
       */
      await this.deleteAuthorizationCode(code)

      /**
       * Create a token
       */
      debugService('execute: ', code)
      const data = await this.createToken(code, client)

      /**
       * Validate the token
       */
      const model = new TokenModel(data, {
        allowExtendedTokenAttributes: this.allowExtendedTokenAttributes,
      })

      /**
       * Create a bearer token
       */
      debugService('execute: ended gracefully')
      return new BearerToken(
        model.accessToken,
        model.accessTokenLifetime,
        model.refreshToken,
        model.scope,
        model.customAttributes
      ).valueOf()
    } catch (e) {
      debugService('execute: ', e.name, e.message)

      throw e
    }
  }
}

module.exports = AuthorizationCodeGrant
