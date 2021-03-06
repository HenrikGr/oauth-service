/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const { InvalidArgumentError, InvalidRequestError } = require('../../errors')
const is = require('../../validator/is')

/**
 * Provides a logical implementation of access token request
 * for the refresh token flow
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-6
 */
class AccessTokenRequest {
  /**
   * Create an AccessTokenRequest instance
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
     * Validate the requested refresh token
     */
    const { refresh_token: refreshToken } = request.body
    if (!refreshToken) {
      throw new InvalidRequestError('Missing parameter: `refresh_token`')
    }

    if (!is.vschar(refreshToken)) {
      throw new InvalidRequestError('Invalid parameter: `refresh_token`')
    }
    /**
     * Validate requested scope
     */
    const { scope } = request.body
    if (!is.nqschar(scope)) {
      throw new InvalidRequestError('Invalid parameter: `scope`')
    }

    /**
     * The requested refresh token
     * @type {String}
     * @private
     */
    this._refresh_token = refreshToken

    /**
     * The requested scope
     * @type {String}
     * @private
     */
    this._scope = scope

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
   * Getter for the requested refresh token
   * @returns {String}
   */
  get refreshToken() {
    return this._refresh_token
  }

  /**
   * Getter for the requested scope
   * @returns {String}
   */
  get scope() {
    return this._scope
  }
}

module.exports = AccessTokenRequest
