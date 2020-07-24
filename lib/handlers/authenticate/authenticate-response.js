/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const { InvalidArgumentError, ServerError, OAuthError } = require('../../errors')
const Response = require('../../response')


/**
 * Provides a logical implementation of an authentication response
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6750#section-4
 */
class AuthenticateResponse {
  /**
   * Create a new instance of AuthorizeResponse class
   *
   * @param {Response} response - The Oauth 2 server response object
   */
  constructor(response) {
    if (!(response instanceof Response)) {
      throw new InvalidArgumentError('Invalid argument: `response` must be an instance of Response')
    }

    /**
     * Response object
     * @type {Response}
     * @private
     */
    this._response = response
  }

  /**
   * Getter for the response object
   * @returns {Response}
   */
  get response() {
    return this._response
  }

  /**
   * Get header field
   * @param {String} field - The header field value
   * @returns {*}
   */
  getHeader(field) {
    return this.response.get(field)
  }

  /**
   * Set response header
   * @param {String} field - The header field key
   * @param {String} value - The header field value
   */
  setHeader(field, value) {
    this.response.set(field, value)
  }

  /**
   * Set response body
   * @param {Object} body - The body value
   */
  setBody(body) {
    this.response.body = body
  }

  /**
   * Set response status
   * @param {Number} status - The response status
   */
  setStatus(status) {
    this.response.status = status
  }

  /**
   * Set response on success
   * @param {Object} token - The token
   * @param {String} scope - The scope
   * @param {Boolean} addAcceptedScopesHeader
   * @param {Boolean} addAuthorizedScopesHeader
   */
  setSuccessResponse(token, scope, addAcceptedScopesHeader, addAuthorizedScopesHeader) {

    if (scope && addAcceptedScopesHeader) {
      this.setHeader('X-Accepted-OAuth-Scopes', scope)
    }

    if (scope && addAuthorizedScopesHeader) {
      this.setHeader('X-OAuth-Scopes', token.scope);
    }
  }

  /**
   * Set response on error
   *
   * Include the "WWW-Authenticate" response header field if the client
   * lacks any authentication information.
   *
   * @param error
   */
  setErrorResponse(error) {
    if(error.name === 'unauthorized_request') {
      this.setHeader('WWW-Authenticate', 'Bearer realm="Service"')
    }

    if (!(error instanceof OAuthError)) {
      error = new ServerError(error)
    }

    this.setBody({
      error: error.name,
      error_description: error.message
    })

    this.setStatus(error.status)
  }
}

module.exports = AuthenticateResponse
