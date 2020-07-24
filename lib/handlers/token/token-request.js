/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const auth = require('basic-auth')
const { InvalidArgumentError, InvalidRequestError, UnsupportedGrantTypeError } = require('../../errors')
const Request = require('../../request')
const is = require('../../validator/is')


/**
 * Provides a logical representation token request
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-3.2
 */
class TokenRequest {
  /**
   * Create a TokenRequest object
   *
   * @param {Request} request - The OAuth 2 request object
   * @param {Array} allowedGrants - Supported grant types
   * @param {Object } requireClientAuthentication - require client authentication
   */
  constructor(request,
    allowedGrants = [],
    requireClientAuthentication = { password: true, refresh_token: true }
    ) {
    if (!(request instanceof Request)) {
      throw new InvalidArgumentError('Invalid argument: `request` must be an instance of Request')
    }

    if (request.method !== 'POST') {
      throw new InvalidRequestError('Invalid request: method must be POST')
    }

    if (!request.is('application/x-www-form-urlencoded')) {
      throw new InvalidRequestError(
        'Invalid request: content must be application/x-www-form-urlencoded'
      )
    }

    /**
     * Validate grant type
     */
    const { grant_type } = request.body
    if (!grant_type) {
      throw new InvalidRequestError('Missing parameter: `grant_type`')
    }

    if (!is.nchar(grant_type) && !is.uri(grant_type)) {
      throw new InvalidRequestError('Invalid parameter: `grant_type`')
    }

    if (!allowedGrants.includes(grant_type)) {
      throw new UnsupportedGrantTypeError('Unsupported grant type: `grant_type` is invalid')
    }

    /**
     * Validate client credentials from the request object
     *
     * The client credentials can be sent using;
     * - HTTP Basic Authentication schema, or
     * - `client_id` and `client_secret` embedded in the body
     * @see https://tools.ietf.org/html/rfc6749#section-2.3.1
     */
    const { client_secret, client_id } = request.body
    const authCredentials = auth(request)
    const credentials = authCredentials
      ? {
          clientId: authCredentials.name,
          clientSecret: authCredentials.pass,
        }
      : {
          clientId: client_id,
          clientSecret: client_secret,
        }

    if (!credentials.clientId) {
      throw new InvalidRequestError('Missing parameter: `client_id`')
    }

    if (
      grant_type === 'password' &&
      requireClientAuthentication.password &&
      !credentials.clientSecret
    ) {
      throw new InvalidRequestError('Missing parameter: `client_secret`')
    }

    if (
      grant_type === 'refresh_token' &&
      requireClientAuthentication.refresh_token &&
      !credentials.clientSecret
    ) {
      throw new InvalidRequestError('Missing parameter: `client_secret`')
    }

    if (!is.vschar(credentials.clientId)) {
      throw new InvalidRequestError('Invalid parameter: `client_id`')
    }

    if (credentials.clientSecret && !is.vschar(credentials.clientSecret)) {
      throw new InvalidRequestError('Invalid parameter: `client_secret`')
    }

    /**
     * The requested grant type
     * @type {String}
     * @private
     */
    this._grantType = grant_type

    /**
     * The client credentials
     * @type {{clientId: *, clientSecret}|{clientId: *, clientSecret: *}}
     * @private
     */
    this._credentials = credentials

    /**
     * The request object
     * @type {Request}
     * @private
     */
    this._request = request
  }

  /**
   * Getter for the request object
   * @returns {Request}
   */
  get request() {
    return this._request
  }

  /**
   * Getter for the grant type
   * @returns {String}
   */
  get grantType() {
    return this._grantType
  }

  /**
   * Getter for client credentials
   * @returns {{clientId: *, clientSecret}|{clientId: *, clientSecret: *}}
   */
  get credentials() {
    return this._credentials
  }
}

module.exports = TokenRequest
