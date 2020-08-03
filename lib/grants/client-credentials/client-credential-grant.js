/**
 * @prettier
 *
 * @description
 * The client can request an access token using only its client
 * credentials (or other supported means of authentication) when the
 * client is requesting access to the protected resources under its
 * control, or those of another resource owner that have been previously
 * arranged with the authorization server (the method of which is beyond
 * the scope of this specification)
 *
 * The client credentials grant type MUST only be used by
 * confidential clients
 *
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const AbstractGrant = require('../abstract-grant')
const { InvalidArgumentError, InvalidGrantError } = require('../../errors')
const TokenModel = require('../../models/token')
const { BearerToken } = require('../../models')
const AccessTokenRequest = require('./access-token-request')
const { log, error } = require('@hgc-ab/debug-service')('oauth:tokenHandler:clientCredentialsGrant')

/**
 * Implements client credentials grant
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-4.4
 */
class ClientCredentialGrant extends AbstractGrant {
  /**
   * Create a client credential grant instance
   *
   * @param {Object|*} model - The data access model
   * @param {Function} model.getUserFromClient - Get user from client
   * @param {Function} model.saveToken - Save token
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

    if (!model.getUserFromClient) {
      throw new InvalidArgumentError(
        'Invalid argument: model does not implement `getUserFromClient()`'
      )
    }

    if (!model.saveToken) {
      throw new InvalidArgumentError('Invalid argument: model does not implement `saveToken()`')
    }
  }

  /**
   * Validate user associated with the authenticated client
   *
   * @param {Object} client- The authenticated client object
   * @returns {Promise<Object>} - The validated user object
   * @throws {InvalidGrantError}
   */
  async validateUser(client) {
    log('validateUser: ', client.user.username)
    const user = await this.model.getUserFromClient(client)
    if (!user) {
      throw new InvalidGrantError('Invalid grant: user credentials are invalid')
    }

    return user
  }

  /**
   * Create a new access token
   *
   * @param {Object} client - The authenticated client
   * @param {Object} user - The validated user object
   * @param {AccessTokenRequest} accessTokenRequest - The validated scope
   * @returns {Promise<boolean|Object>}
   */
  async createToken(client, user, accessTokenRequest) {
    log('createToken: ', accessTokenRequest.scope)
    const accessScope = await super.validateScope(client, user, accessTokenRequest.scope)
    const accessToken = await super.generateAccessToken(client, user, accessTokenRequest.scope)
    const accessTokenExpiresAt = super.setAccessTokenExpiresAt()

    const token = {
      accessToken,
      accessTokenExpiresAt,
      scope: accessScope,
    }

    return this.model.saveToken(client, user, token)
  }

  /**
   * Process client credentials grant flow
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @param {Object} client- The authenticated client object
   * @returns {Promise<*>}
   */
  async execute(request, response, client) {
    try {

      log('execute: started')

      /**
       * Validate request parameters
       * @type {AccessTokenRequest}
       */
      const accessTokenRequest = new AccessTokenRequest(request, client)

      /**
       * Validate user
       * @type {Object}
       */
      const user = await this.validateUser(client)

      /**
       * Create a token
       */
      const data = await this.createToken(client, user, accessTokenRequest)

      /**
       * Validate the token
       */
      const model = new TokenModel(data, {
        allowExtendedTokenAttributes: this.allowExtendedTokenAttributes,
      })

      /**
       * Create a bearer token
       */
      log('execute: ended gracefully')
      return new BearerToken(
        model.accessToken,
        model.accessTokenLifetime,
        model.refreshToken,
        model.scope,
        model.customAttributes
      ).valueOf()

    } catch (e) {
      error('execute: ', e.name, e.message)

      throw e
    }
  }
}

module.exports = ClientCredentialGrant
