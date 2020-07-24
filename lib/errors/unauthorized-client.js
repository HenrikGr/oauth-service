/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const OAuthError = require('./oauth-error')

/**
 * The authenticated client is not authorized to use this authorization grant type.
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
 */
class UnauthorizedClientError extends OAuthError {
  constructor(message = '', properties) {
    super(message, { code: 400, name: 'unauthorized_client', ...properties });
  }
}

module.exports = UnauthorizedClientError
