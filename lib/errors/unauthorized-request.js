/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const OAuthError = require('./oauth-error')

/**
 * "If the request lacks any authentication information (e.g., the client
 * was unaware that authentication is necessary or attempted using an
 * unsupported authentication method), the resource server SHOULD NOT
 * include an error code or other error information."
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6750#section-3.1
 */
class UnauthorizedRequestError extends OAuthError {
  constructor(message = '', properties) {
    super(message, { code: 401, name: 'unauthorized_request', ...properties });
  }
}

module.exports = UnauthorizedRequestError
