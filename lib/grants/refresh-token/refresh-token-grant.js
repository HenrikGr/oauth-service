/**
 * @prettier
 *
 * @description
 * Refresh tokens are credentials used to obtain access tokens.  Refresh
 * tokens are issued to the client by the authorization server and are
 * used to obtain a new access token when the current access token
 * becomes invalid or expires, or to obtain additional access tokens
 * with identical or narrower scope (access tokens may have a shorter
 * lifetime and fewer permissions than authorized by the resource
 * owner)
 *
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const AbstractGrant = require('../abstract-grant')
const { InvalidArgumentError, InvalidGrantError, ServerError } = require('../../errors')
const TokenModel = require('../../models/token')
const { BearerToken } = require('../../models')
const AccessTokenRequest = require('./access-token-request')
const debugService = require('@hgc-ab/debug-service')('tokenHandler:refreshTokenGrant')

/**
 * Implements refresh token grant
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-6
 */
class RefreshTokenGrant extends AbstractGrant {
  /**
   * Create a refresh token grant instance
   *
   * @param {Object|*} model - The data access model
   * @param {Function} model.getRefreshToken - Get refresh token
   * @param {Function} model.revokeRefreshToken - Revoke refresh token
   * @param {Function} model.saveToken - Save token
   * @param {Object} options - Optional settings
   * @param {Number} options.accessTokenLifetime
   * @param {Number} options.refreshTokenLifetime
   * @param {Boolean} options.alwaysIssueNewRefreshToken
   * @param {Boolean} options.allowExtendedTokenAttributes
   * @throws {InvalidArgumentError}
   */
  constructor(model, options = {
    accessTokenLifetime: 1800,
    refreshTokenLifetime: 86400,
    alwaysIssueNewRefreshToken: true,
    allowExtendedTokenAttributes: false,
  }) {
    super(model, options)

    if (!model) {
      throw new InvalidArgumentError('Missing parameter: `model`')
    }

    if (!model.getRefreshToken) {
      throw new InvalidArgumentError(
        'Invalid argument: model does not implement `getRefreshToken()`'
      )
    }

    if (!model.revokeRefreshToken) {
      throw new InvalidArgumentError('Invalid argument: model does not implement `revokeRefreshToken()`')
    }

    if (!model.saveToken) {
      throw new InvalidArgumentError('Invalid argument: model does not implement `saveToken()`')
    }
  }


  /**
   * Validate the refresh token
   *
   * @param {AccessTokenRequest} accessTokenRequest - The requested refresh token
   * @param {Object} client - The authenticated client
   * @returns {Promise<Object>}
   * @throws {InvalidGrantError|ServerError}
   */
  async validateRefreshToken(accessTokenRequest, client) {
    debugService('validateRefreshToken: ', accessTokenRequest.refreshToken)
    const token = await this.model.getRefreshToken(accessTokenRequest.refreshToken)
    const now = new Date()

    if (!token) {
      throw new InvalidGrantError('Invalid grant: refresh token is invalid')
    }

    if (!token.client) {
      throw new ServerError('Server error: `getRefreshToken()` did not return a `client` object')
    }

    if (!token.user) {
      throw new ServerError('Server error: `getRefreshToken()` did not return a `user` object')
    }

    if (token.client.id !== client.id) {
      throw new InvalidGrantError('Invalid grant: refresh token is invalid')
    }

    if (token.refreshTokenExpiresAt && !(token.refreshTokenExpiresAt instanceof Date)) {
      throw new ServerError('Server error: `refreshTokenExpiresAt` must be a Date instance')
    }

    if (token.refreshTokenExpiresAt && token.refreshTokenExpiresAt.getTime() < now.getTime()) {
      throw new InvalidGrantError('Invalid grant: refresh token has expired')
    }

    return token
  }

  /**
   * Revoke the old refresh token.
   *
   * @param {Object} token - The token object return from validateRefreshToken
   * @see https://tools.ietf.org/html/rfc6749#section-6
   */
  async deleteRefreshToken(token) {
    debugService('deleteRefreshToken: ', token.refreshToken)

    // Keep it if the new token does not include a refresh token
    if (!this.alwaysIssueNewRefreshToken) {
      return
    }

    const status = await this.model.revokeRefreshToken(token)
    if (!status) {
      throw new InvalidGrantError('Invalid grant: refresh token is invalid')
    }
  }

  /**
   * Create a token
   *
   * @param {Object} client - The authenticated client
   * @param {Object} user - The user stored in the validated refresh token
   * @param {String} scope - The scope stored in the validated refresh token
   * @returns {Promise<boolean|Object>}
   */
  async createToken(client, user, scope) {
    debugService('createToken: ', scope)
    const accessToken = await super.generateAccessToken(client, user, scope)
    const refreshToken = await super.generateRefreshToken(client, user, scope)
    const accessTokenExpiresAt = super.setAccessTokenExpiresAt()
    const refreshTokenExpiresAt = super.setRefreshTokenExpiresAt()

    const token = {
      accessToken,
      accessTokenExpiresAt,
      scope,
    }

    if (this.alwaysIssueNewRefreshToken !== false) {
      token.refreshToken = refreshToken
      token.refreshTokenExpiresAt = refreshTokenExpiresAt
    }

    return await this.model.saveToken(client, user, token)
  }

  /**
   * Process refresh token grant flow
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @param {Object} client- The authenticated client object
   * @returns {Promise<*>}
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
       * Validate refresh token
       */
      const token = await this.validateRefreshToken(accessTokenRequest, client)

      /**
       * Delete the old refresh token
       */
      await this.deleteRefreshToken(token)

      /**
       * Create a new token
       */
      const data = await this.createToken(client, token.user, token.scope)

      /**
       * Validate the token
       */
      const model = new TokenModel(data, {
        allowExtendedTokenAttributes: super.allowExtendedTokenAttributes,
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

module.exports = RefreshTokenGrant
