/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const OAuthError = require('./oauth-error')

/**
 * The access token provided is expired, revoked, malformed, or invalid for other reasons.
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6750#section-3.1
 */
class InvalidTokenError extends OAuthError {
  constructor(message = '', properties) {
    super(message, { code: 401, name: 'invalid_token', ...properties });
  }
}

module.exports = InvalidTokenError
