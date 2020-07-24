/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const OAuthError = require('./oauth-error')

/**
 * The provided authorization grant (e.g., authorization code, resource owner credentials)
 * or refresh token is invalid, expired, revoked, does not match the redirection URI used
 * in the authorization request, or was issued to another client.
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-5.2
 */
class InvalidGrantError extends OAuthError {
  constructor(message = '', properties) {
    super(message, { code: 400, name: 'invalid_grant', ...properties });
  }
}

module.exports = InvalidGrantError
