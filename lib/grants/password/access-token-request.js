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
 * for the resource owner password flow
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-4.3.2
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
     * Validate requested user credentials
     * @type {{password: *, username: *}}
     */
    const credentials = {
      username: request.body.username,
      password: request.body.password,
    }

    if (!credentials.username) {
      throw new InvalidRequestError('Missing parameter: `username`')
    }

    if (!credentials.password) {
      throw new InvalidRequestError('Missing parameter: `password`')
    }

    if (!is.uchar(credentials.username)) {
      throw new InvalidRequestError('Invalid parameter: `username`')
    }

    if (!is.uchar(credentials.password)) {
      throw new InvalidRequestError('Invalid parameter: `password`')
    }
    /**
     * Validate requested scope
     */
    const { scope } = request.body
    if (!is.nqschar(scope)) {
      throw new InvalidRequestError('Invalid parameter: `scope`')
    }

    /**
     * The requested user credentials
     * @type {{password: *, username: *}}
     * @private
     */
    this._credentials = credentials

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
   * Getter for the requested user credentials
   * @returns {{password: *, username: *}}
   */
  get credentials() {
    return this._credentials
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
