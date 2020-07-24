/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const url = require('url')
const { InvalidArgumentError } = require('../../errors')
const Response = require('../../response')

/**
 * Provides a logical implementation of the authorization response
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-4.1.2
 */
class AuthorizationResponse {
  /**
   * Create an AuthorizationResponse instance
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
   * @param {UrlWithStringQuery} redirectUri - The redirect uri
   */
  setSuccessResponse(redirectUri) {
    this.setHeader('Location', url.format(redirectUri))
    this.setStatus(302)
  }

  /**
   * Set response on error
   *
   * Do not redirect if
   * - the request fails due to a missing, invalid, or mismatching
   *   redirection URI, or if the client identifier is missing or invalid,
   *   the authorization server SHOULD inform the resource owner of the
   *   error and MUST NOT automatically redirect the user-agent to the
   *   invalid redirection URI.
   * - the client lacks any authentication information.
   *
   * @param {OAuthError|Error} error - Error
   * @param {String} uri - The redirect uri
   * @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
   */
  setErrorResponse(error, uri) {
    if (error.name === 'invalid_client' || error.name === 'unauthorized_request') {
      this.setBody({
        error: error.name,
        error_description: error.message,
      })

      this.setStatus(401)
    } else {
      let redirectUri = uri ? url.parse(uri, true) : { query: {} }
      redirectUri.query['error'] = error.name

      if (error.message) {
        redirectUri.query['error_description'] = error.message
      }

      this.setHeader('Location', url.format(redirectUri))
      this.setStatus(302)
      this.setBody({
        error: error.name,
        error_description: error.message,
      })
    }
  }
}

module.exports = AuthorizationResponse
