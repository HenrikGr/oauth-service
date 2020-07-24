/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const { InvalidArgumentError } = require('../../errors')
const Request = require('../../request')
const is = require('../../validator/is')

/**
 * Provides a logical implementation of access token request
 * for the client credentials flow
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-4.4.2
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
     * Validate requested scope
     */
    const scope = request.body.scope
    if (!is.nqschar(scope)) {
      throw new InvalidArgumentError('Invalid parameter: `scope`')
    }

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
   * Getter for the requested scope
   * @returns {String}
   */
  get scope() {
    return this._scope
  }
}

module.exports = AccessTokenRequest
