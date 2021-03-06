/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const url = require('url')
const { InvalidArgumentError, ServerError } = require('../../../errors')
const tokenUtil = require('../../../utils/token')
const { log, error } = require('@hgc-ab/debug-service')('oauth:authorizeHandler:codeResponse')

/**
 * Implements authorization code response
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-3.1.1
 */
class CodeResponse {
  /**
   * Create a new code response instance
   * @param {Object|*} model - The data access model
   * @param {Function} model.saveAuthorizationCode - Save authorization code
   * @param {Function} [model.generateAuthorizationCode] - Generate authorization code
   * @param {Object} options - Optional settings
   * @param {Number} options.authorizationCodeLifetime - The life time of the authorization code
   */
  constructor(model, options = { authorizationCodeLifetime: 300 }) {
    if (!model) {
      throw new InvalidArgumentError('Missing parameter: `model`')
    }

    if (!model.saveAuthorizationCode) {
      throw new InvalidArgumentError(
        'Invalid argument: model does not implement `saveAuthorizationCode()`'
      )
    }

    if (!options.authorizationCodeLifetime) {
      throw new InvalidArgumentError('Missing parameter: `authorizationCodeLifetime`')
    }

    /**
     * The data access model
     * @type {{saveAuthorizationCode: Function, generateAuthorizationCode?: Function}|*}
     */
    this.model = model

    /**
     * Authorization code life time
     * @type {Number}
     */
    this.authorizationCodeLifetime = options.authorizationCodeLifetime
  }


  /**
   * Set authorization code expiration date
   *
   * @param {Object} client - The validated client object
   * @returns {Date}
   */
  setAuthorizationCodeExpiresAt(client) {
    const now = new Date()
    const authorizationCodeLifetime =
      client.authorizationCodeLifetime || this.authorizationCodeLifetime
    return new Date(now.getTime() + authorizationCodeLifetime * 1000)
  }

  /**
   * Create a new authorization code
   *
   * @param {Object} client - The validated client
   * @param {Object} user - The authenticated resource owner
   * @param {String} scope - The validated scope
   * @param {String} redirectUri - The validated redirect uri
   * @returns {Promise<*>}
   */
  async createAuthorizationCode(client, user, scope, redirectUri) {
    log('createAuthorizationCode', scope)
    let authorizationCode
    if (this.model.generateAuthorizationCode) {
      authorizationCode = await this.model.generateAuthorizationCode(client, user, scope)
      if (!authorizationCode) {
        throw new ServerError(
          'Server error: `generateAuthorizationCode` did not return an `authorizationCode` value'
        )
      }
    } else {
      authorizationCode = tokenUtil.generateRandomToken()
    }

    const expiresAt = this.setAuthorizationCodeExpiresAt(client)
    const code = await this.model.saveAuthorizationCode(
      client,
      user,
      {
        authorizationCode,
        scope,
        redirectUri,
        expiresAt,
      }
    )

    if (!code || !code['authorizationCode']) {
      throw new ServerError(
        'Server error: `saveAuthorizationCode` did not return an `authorizationCode` value'
      )
    }

    return code['authorizationCode']
  }

  /**
   * Build redirect uri
   *
   * @param {String} code - The authorization code
   * @param {String} scope - The validated scope
   * @param {String} uri - The requested redirect uri
   * @param {String} state - The requested state
   * @returns {UrlWithStringQuery}
   */
  buildRedirectUri(code, scope, uri, state) {
    let redirectUri = url.parse(uri, true)
    redirectUri.search = null
    redirectUri.query['code'] = code

    if (scope) {
      redirectUri.query['scope'] = scope
    }

    if (state) {
      redirectUri.query['state'] = state
    }

    // noinspection JSValidateTypes
    return redirectUri
  }

  /**
   * Handle authorization code response type
   *
   * @param {Object} client - The validated client object
   * @param {Object} user - The authenticated resource owner
   * @param {String} scope - The validated scope
   * @param {String} redirectUri - The validated redirect uri
   * @param {String} state - The requested state
   * @returns {Promise<UrlWithStringQuery>}
   */
  async execute(client, user, scope, redirectUri, state) {
    try {

      log('execute: started')

      /**
       * Create authorization code
       */
      const code = await this.createAuthorizationCode(client, user, scope, redirectUri)

      /**
       * Build redirect endpoint
       */
      log('execute: ended gracefully')
      return this.buildRedirectUri(code, scope, redirectUri, state)
    } catch (e) {
      error('execute:', e.name, e.message)
      throw e
    }
  }
}

module.exports = CodeResponse
