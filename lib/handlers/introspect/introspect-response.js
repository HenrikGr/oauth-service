/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const { InvalidArgumentError, ServerError, OAuthError } = require('../../errors')

const Response = require('../../response')

/**
 * Provides a logical implementation of the introspect response
 *
 * @class
 * @see https://tools.ietf.org/html/rfc7662#section-2.2
 */
class IntrospectResponse {
  /**
   * Create a new instance of introspect response class
   *
   * @param {Response} response - The OAuth 2 server response object
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
   * @param {Object} body - The body value
   */
  setSuccessResponse(body) {
    this.setHeader('Cache-Control', 'no-store')
    this.setHeader('Pragma', 'no-cache')
    this.setBody(body)
  }

  /**
   * Set response on error
   *
   * Include the "WWW-Authenticate" response header field if the client
   * attempted to authenticate via the "Authorization" request header.
   *
   * @param {OAuthError|Error} error - Error
   * @param isAuthorizationHeader
   * @see https://tools.ietf.org/html/rfc6749#section-5.2.
   */
  setErrorResponse(error, isAuthorizationHeader) {
    if (error.name === 'invalid_client' && isAuthorizationHeader) {
      this.setHeader('WWW-Authenticate', 'Basic realm="Service"')
      this.setBody({ error: error.name, error_description: error.message })
      this.setStatus(401)
    } else {
      if (!(error instanceof OAuthError)) {
        error = new ServerError(error)
      }

      this.setBody({ error: error.name, error_description: error.message })
      this.setStatus(error.status)
    }
  }
}

module.exports = IntrospectResponse
