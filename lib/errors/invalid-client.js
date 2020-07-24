/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const OAuthError = require('./oauth-error')

/**
 * Client authentication failed (e.g., unknown client, no client
 * authentication included, or unsupported authentication method)"
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-5.2
 */
class InvalidClientError extends OAuthError {
  constructor(message = '', properties) {
    super(message, { code: 400, name: 'invalid_client', ...properties });
  }
}


module.exports = InvalidClientError
