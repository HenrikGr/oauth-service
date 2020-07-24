/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
  InvalidArgumentError,
  InvalidRequestError,
  UnauthorizedRequestError,
} = require('../../errors')

const Request = require('../../request')

/**
 * Provides a logical implementation of an authentication request object
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-7
 */
class AuthenticateRequest {
  /**
   * Create a new AuthenticateRequest instance
   *
   * @param {Request} request - The OAuth 2 request object
   * @param {Boolean} allowBearerTokensInQueryString - allow bearer token in query string
   */
  constructor(request, allowBearerTokensInQueryString = false) {
    if (!(request instanceof Request)) {
      throw new InvalidArgumentError('Invalid argument: `request` must be an instance of Request');
    }

    /**
     * Get the Bearer access token from the request
     *
     * @see https://tools.ietf.org/html/rfc6750#section-2
     */
    const headerToken = request.get('Authorization');
    const queryToken = request.query.access_token;
    const bodyToken = request.body.access_token;
    let token = undefined

    if (!(headerToken || queryToken || bodyToken)) {
      throw new UnauthorizedRequestError(
        'Unauthorized request: no authentication given',
      );
    }

    if ([headerToken, queryToken, bodyToken].filter(Boolean).length > 1) {
      throw new InvalidRequestError(
        'Invalid request: only one authentication method is allowed',
      );
    }

    if (headerToken) {
      const bearerToken = request.get('Authorization');
      const matches = bearerToken.match(/Bearer\s(\S+)/);

      if (!matches) {
        throw new InvalidRequestError(
          'Invalid request: malformed authorization header',
        );
      }

      token = matches[1]
    }

    /**
     * Don't pass bearer tokens in page URLs:  Bearer tokens SHOULD NOT be passed in page
     * URLs (for example, as query string parameters). Instead, bearer tokens SHOULD be
     * passed in HTTP message headers or message bodies for which confidentiality measures
     * are taken.
     * @see http://tools.ietf.org/html/rfc6750#section-2.3
     */
    if (queryToken) {
      if (!allowBearerTokensInQueryString) {
        throw new InvalidRequestError(
          'Invalid request: do not send bearer tokens in query URLs',
        );
      }

      token = request.query.access_token;
    }

    /**
     * Get the Bearer access token from the request body.
     *
     * @see http://tools.ietf.org/html/rfc6750#section-2.2
     */
    if (bodyToken) {
      if (request.method === 'GET') {
        throw new InvalidRequestError(
          'Invalid request: token may not be passed in the body when using the GET verb',
        );
      }

      if (!request.is('application/x-www-form-urlencoded')) {
        throw new InvalidRequestError(
          'Invalid request: content must be application/x-www-form-urlencoded',
        );
      }

      token = request.body.access_token;
    }

    /**
     * The access token
     * @type {String}
     */
    this._token = token
  }

  /**
   * Getter for the access token
   * @return {String}
   */
  get token() {
    return this._token
  }
}


module.exports = AuthenticateRequest
