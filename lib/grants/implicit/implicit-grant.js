/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const { InvalidArgumentError } = require('../../errors')
const TokenModel = require('../../models/token')
const { BearerToken } = require('../../models')
const tokenUtil = require('../../utils/token')
const debugService = require('@hgc-ab/debug-service')('implicitGrant')

/**
 * Implements the implicit grant
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-4.2
 */
class ImplicitGrant {
  /**
   * Create an implicit grant instance
   *
   * @param {Object|*} model - The data access model
   * @param {Object} user - The authenticated resource owner
   * @param {String} scope - The validated requested scope
   * @param {Object} options - Optional settings
   * @throws {InvalidArgumentError}
   */
  constructor(model, user, scope, options = {
    accessTokenLifetime: 1800,
    allowExtendedTokenAttributes: false }
  ) {
    if (!model) {
      throw new InvalidArgumentError('Missing parameter: `model`')
    }

    if (!model.saveToken) {
      throw new InvalidArgumentError('Invalid argument: model does not implement `saveToken()`')
    }

    if (!user) {
      throw new InvalidArgumentError('Missing parameter: `user`')
    }

    if (!scope) {
      throw new InvalidArgumentError('Missing parameter: `scope`')
    }

    /**
     * validated scope from
     * @type {String}
     */
    this.scope = scope

    /**
     * The verified resource owner
     * @type {Object}
     */
    this.user = user

    /**
     * The data access model
     * @type {{saveToken}|*}
     */
    this.model = model

    /**
     * Access token life time
     * @type {number}
     */
    this.accessTokenLifetime = options.accessTokenLifetime

    /**
     * Allow extended token attributes
     * @type {boolean}
     */
    this.allowExtendedTokenAttributes = options.allowExtendedTokenAttributes
  }

  /**
   * Create token.
   *
   * @param {Object} client - The validated client
   * @param {Object} user - The authenticated resource owner
   * @param {String} scope - The validated requested scope
   * @returns {Promise<string|any>}
   */
  async createToken(client, user, scope) {
    if (this.model.generateAccessToken) {
      const token = await this.model.generateAccessToken(client, user, scope)
      return token ? token : tokenUtil.generateRandomToken()
    }
    return tokenUtil.generateRandomToken()
  }

  /**
   * Set access token expiration date by using epoch time in UTC
   *
   * @returns {Date}
   */
  setAccessTokenExpiresAt() {
    const now = new Date()
    return new Date(now.getTime() + this.accessTokenLifetime * 1000)
  }

  /**
   * Create a access token
   *
   * @param {Object} client - The validated client
   * @returns {Promise<boolean|Object>}
   */
  async createAccessToken(client) {
    debugService('createAccessToken', client.name)
    const accessToken = await this.createToken(client, this.user, this.scope)
    const accessTokenExpiresAt = this.setAccessTokenExpiresAt()

    const token = {
      accessToken,
      accessTokenExpiresAt,
      scope: this.scope,
    }

    return await this.model.saveToken(token, client, this.user)
  }

  /**
   * Process implicit grant flow
   *
   * @param {Object} client - The validated client
   * @returns {Promise<*>}
   */
  async execute(client) {
    try {

      debugService('execute: started')

      /**
       * Create a new access token
       */
      const accessToken = await this.createAccessToken(client)

      /**
       * Validate the access token
       */
      const model = new TokenModel(accessToken, {
        allowExtendedTokenAttributes: this.allowExtendedTokenAttributes,
      })

      /**
       * Return a bearer token
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
      debugService('', e.name, e.message)
      throw e
    }
  }
}

module.exports = ImplicitGrant
