/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const auth = require('basic-auth')
const { InvalidArgumentError, InvalidRequestError } = require('../../errors')

const Request = require('../../request')
const is = require('../../validator/is')

/**
 * Provides a logical representation of an introspect request object
 *
 * @class
 * @see https://tools.ietf.org/html/rfc7662#section-2.1
 */
class IntrospectRequest {
  /**
   * Create an IntrospectRequest object
   *
   * @param {Request} request - The Oauth2 request object
   * @param {Boolean} isClientSecretRequired - Client secret require options
   */
  constructor(request, isClientSecretRequired = true) {
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
     * Validate client credentials
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

    if (!is.vschar(credentials.clientId)) {
      throw new InvalidRequestError('Invalid parameter: `client_id`')
    }

    if (isClientSecretRequired && !credentials.clientSecret) {
      throw new InvalidRequestError('Missing parameter: `client_secret`')
    }

    if (credentials.clientSecret && !is.vschar(credentials.clientSecret)) {
      throw new InvalidRequestError('Invalid parameter: `client_secret`')
    }

    /**
     * Validate token hint and token
     */
    const token = request.body.token
    const tokenHint = request.body.token_hint

    if (!tokenHint && !token) {
      throw new InvalidRequestError('Missing parameter: `token_hint` and `token`')
    }

    if (!token) {
      throw new InvalidRequestError('Missing parameter: `token`')
    }

    if (!tokenHint) {
      throw new InvalidRequestError('Missing parameter: `token_hint`')
    }

    if (!(tokenHint === 'access_token' || tokenHint === 'refresh_token')) {
      throw new InvalidRequestError('Invalid parameter: `token_hint`')
    }

    /**
     * Client credentials
     * @type {{clientId: *, clientSecret: *}}
     * @private
     */
    this._credentials = {
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
    }

    /**
     * Token hint
     */
    this._tokenHint = tokenHint

    /**
     * Token to introspect
     * @private
     */
    this._token = token
  }

  /**
   * Get client credentials
   * @returns {{clientId: *, clientSecret: *}}
   */
  get credentials() {
    return this._credentials
  }

  /**
   * Get token hint
   * @returns {*}
   */
  get tokenHint() {
    return this._tokenHint
  }

  /**
   * Get token to introspect
   * @returns {*}
   */
  get token() {
    return this._token
  }
}

module.exports = IntrospectRequest
