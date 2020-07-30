/**
 * @prettier
 *
 * @description
 * The resource owner password credentials grant type is suitable in
 * cases where the resource owner has a trust relationship with the
 * client, such as the device operating system or a highly privileged
 * application
 *
 * This grant type is suitable for clients capable of obtaining the
 * resource owner's credentials (username and password, typically using
 * an interactive form)
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
const debugService = require('@hgc-ab/debug-service')('oauth:tokenHandler:passwordGrant')

/**
 * Implements resource owner password grant
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-4.3
 */
class PasswordGrant extends AbstractGrant {
  /**
   * Create a password grant instance
   *
   * @param {Object|*} model - The data access model
   * @param {Function} model.getUser - Get user
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

    if (!model.getUser) {
      throw new InvalidArgumentError('Invalid argument: model does not implement `getUser()`')
    }

    if (!model.saveToken) {
      throw new InvalidArgumentError('Invalid argument: model does not implement `saveToken()`')
    }
  }


  /**
   * Validate user
   *
   * @param {AccessTokenRequest} accessTokenRequest - The requested user credentials
   * @returns {Promise<Object>} - The validated user object
   * @throws {InvalidGrantError}
   */
  async validateUser(accessTokenRequest) {
    debugService('validateUser: ', accessTokenRequest.credentials.username)
    const { username, password } = accessTokenRequest.credentials
    const user = await this.model.getUser(username, password)
    if (!user) {
      throw new InvalidGrantError('Invalid grant: user credentials are invalid')
    }

    return user
  }

  /**
   * Create a token
   *
   * @param {Object} client - The authenticated client
   * @param {Object} user - The validated user object
   * @param {AccessTokenRequest} accessTokenRequest - The requested scope
   * @returns {Promise<boolean|Object>}
   */
  async createToken(client, user, accessTokenRequest) {
    debugService('createToken: ', accessTokenRequest.scope)
    const accessScope = await super.validateScope(client, user, accessTokenRequest.scope)
    const accessToken = await super.generateAccessToken(client, user, accessTokenRequest.scope)
    const refreshToken = await super.generateRefreshToken(client, user, accessTokenRequest.scope)
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
   * Process resource owner password grant
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @param {Object} client - The authenticated client
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
       * Validate user
       * @type {Object}
       */
      const user = await this.validateUser(accessTokenRequest)

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
       * Return token
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

module.exports = PasswordGrant
