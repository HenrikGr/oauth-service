/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
  AccessDeniedError,
  InvalidArgumentError,
  InvalidRequestError,
  InvalidScopeError,
  UnsupportedResponseTypeError
} = require('../../errors')

const Request = require('../../request')
const is = require('../../validator/is')


/**
 * Provides a logical representation of a authorization request object
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-4.1.1
 */
class AuthorizationRequest {
  /**
   * Create an AuthorizeRequest instance
   *
   * @param {Request} request - The Oauth 2 request object
   * @param {Boolean} allowEmptyState - Allow empty state
   */
  constructor(request, allowEmptyState = false) {

    if (!(request instanceof Request)) {
      throw new InvalidArgumentError('Invalid argument: `request` must be an instance of Request')
    }

    if ('false' === request.query.allowed) {
      throw new AccessDeniedError('Access denied: user denied access to application')
    }

    /**
     * Validate response type
     */
    const requestResponseType = request.body.response_type || request.query.response_type
    if (!requestResponseType) {
      throw new InvalidRequestError('Missing parameter: `response_type`')
    }

    if (!(requestResponseType === 'code' || requestResponseType === 'token')) {
      throw new UnsupportedResponseTypeError('Invalid parameter: `response_type`')
    }

    /**
     * Validate redirect uri
     */
    const requestRedirectUri = request.body.redirect_uri || request.query.redirect_uri
    if (!requestRedirectUri) {
      throw new InvalidRequestError('Missing parameter: `redirect_uri`')
    }

    if (requestRedirectUri && !is.uri(requestRedirectUri)) {
      throw new InvalidRequestError('Invalid request: `redirect_uri` is not a valid URI')
    }

    /**
     * Validate client id
     */
    const requestClientId = request.body.client_id || request.query.client_id
    if (!requestClientId) {
      throw new InvalidRequestError('Missing parameter: `client_id`')
    }

    if (!is.vschar(requestClientId)) {
      throw new InvalidRequestError('Invalid parameter: `client_id`')
    }

    /**
     * Validate scope
     */
    const requestScope = request.body.scope || request.query.scope
    if (!is.nqschar(requestScope)) {
      throw new InvalidScopeError('Invalid parameter: `scope`')
    }

    /**
     * Validate state
     */
    const requestState = request.body.state || request.query.state
    if (!allowEmptyState && !requestState) {
      throw new InvalidRequestError('Missing parameter: `state`')
    }

    if (!is.vschar(requestState)) {
      throw new InvalidRequestError('Invalid parameter: `state`')
    }

    /**
     * The requested response type
     * @type {String}
     * @private
     */
    this._responseType = requestResponseType

    /**
     * The requested redirect uri
     * @type {String}
     * @private
     */
    this._redirectUri = requestRedirectUri

    /**
     * The requested client id
     * @type {String}
     * @private
     */
    this._clientId = requestClientId

    /**
     * The requested scope
     * @type {String}
     * @private
     */
    this._scope = requestScope

    /**
     * The requested state
     * @type {String}
     * @private
     */
    this._state = requestState

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
   * Get requested response type
   * @returns {String}
   */
  get responseType() {
    return this._responseType
  }

  /**
   * Get requested redirect uri
   * @returns {String}
   */
  get redirectUri() {
    return this._redirectUri
  }

  /**
   * Get requested client id
   * @returns {String}
   */
  get clientId() {
    return this._clientId
  }

  /**
   * Get requested scope
   * @returns {String}
   */
  get scope() {
    return this._scope
  }

  /**
   * Get requested state
   * @returns {String}
   */
  get state() {
    return this._state
  }

}

module.exports = AuthorizationRequest
