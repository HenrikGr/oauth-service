/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const url = require('url')
const ImplicitGrant = require('../../../grants/implicit/implicit-grant')
const { InvalidArgumentError } = require('../../../errors')
const debugService = require('@hgc-ab/debug-service')('oauth:tokenResponse')

/**
 * Implements token response via Implicit grant
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-3.1.1
 */
class TokenResponse {
  /**
   * Create a new token response instance
   * @param {Object|*} model - The data access model
   * @param {Object} options - Optional settings
   * @param {Number} options.accessTokenLifetime - The life time of the access token
   */
  constructor(model, options = { accessTokenLifetime: 1800 }) {
    if (!model) {
      throw new InvalidArgumentError('Missing parameter: `model`')
    }

    if (!options.accessTokenLifetime) {
      throw new InvalidArgumentError('Missing parameter: `accessTokenLifetime`')
    }

    /**
     * The data access model
     * @type {Object|*}
     */
    this.model = model

    /**
     * Access token life time
     * @type {Number}
     */
    this.accessTokenLifetime = options.accessTokenLifetime
  }

  /**
   * Build redirect url
   *
   * @param {String} uri - The redirect uri
   * @param {String} state - The state
   * @param {Object} token - The access token issued by the implicit grant
   * @returns {UrlWithStringQuery}
   */
  buildRedirectUri(token, uri, state) {
    let redirectUri = url.parse(uri)
    redirectUri.hash = redirectUri.hash || ''
    redirectUri.hash +=
      (redirectUri.hash ? '&' : '') + 'access_token=' + encodeURIComponent(token.access_token)
    redirectUri.hash +=
      (redirectUri.hash ? '&' : '') + 'expires_in=' + encodeURIComponent(this.accessTokenLifetime)
    if (state) {
      redirectUri.hash += (redirectUri.hash ? '&' : '') + 'state=' + encodeURIComponent(state)
    }

    // noinspection JSValidateTypes
    return redirectUri
  }

  /**
   * Handle token response type
   *
   * @param {Object} client - The validated client object
   * @param {Object} user - The authenticated resource owner
   * @param {String} scope - The validated requested scope
   * @param {String} redirectUri - The validated redirect uri
   * @param {String} state - The requested state
   * @return {Promise<UrlWithStringQuery>}
   */
  async execute(client, user, scope, redirectUri, state) {
    try {

      debugService('execute: started')

      /**
       * Issue access token
       * @type {Promise<*>}
       */
      const token = await new ImplicitGrant(this.model, user, scope, {
        accessTokenLifetime: client.accessTokenLifetime || this.accessTokenLifetime,
      }).execute(client)

      /**
       * Build redirect endpoint
       */
      debugService('execute: ended gracefully')
      return this.buildRedirectUri(token, redirectUri, state)
    } catch (e) {
      debugService('execute:', e.name, e.message)
      throw e
    }
  }
}

module.exports = TokenResponse
