/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
  InvalidArgumentError,
  InvalidRequestError,
} = require('../../errors')

const is = require('../../validator/is')


/**
 * Provides a logical implementation of access token request
 * for the authorization code flow
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-4.1.3
 */
class AccessTokenRequest {
  /**
   * Create an instance of AuthorizationCodeRequest object
   *
   * @param {Request} request - The Oauth2 request object
   * @param {Object} client - The validated client
   */
  constructor(request, client) {

    if (!request) {
      throw new InvalidArgumentError('Missing parameter: `request`')
    }

    if (!client) {
      throw new InvalidArgumentError('Missing parameter: `client`')
    }

    /**
     * Validate the requested code
     */
    const { code } = request.body
    if (!code) {
      throw new InvalidRequestError('Missing parameter: `code`')
    }

    if (!is.vschar(code)) {
      throw new InvalidRequestError('Invalid parameter: `code`')
    }

    /**
     * Validate the request redirectUri
     */
    const { redirect_uri: redirect_uri1 } = request.body
    const { redirect_uri: redirect_uri2 } = request.query
    const redirectUri = redirect_uri1 || redirect_uri2

    if (!is.uri(redirectUri)) {
      throw new InvalidRequestError('Invalid request: `redirect_uri` is not a valid URI')
    }

    /**
     * The requested authorization code
     * @type {String}
     * @private
     */
    this._code = code

    /**
     * The requested redirect uri
     * @type {String}
     * @private
     */
    this._redirectUri = redirectUri

    /**
     * The request object
     * @type {Request}
     * @private
     */
    this._request = request
  }

  /**
   * Get request object
   * @returns {Request}
   */
  get request() {
    return this._request
  }

  /**
   * Get requested code
   * @returns {String}
   */
  get code() {
    return this._code
  }

  /**
   * Get requested redirect uri
   * @returns {String}
   */
  get redirectUri() {
    return this._redirectUri
  }

}

module.exports = AccessTokenRequest
