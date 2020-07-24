/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const OAuthError = require('./oauth-error')

/**
 * The authorization grant type is not supported by the authorization server.
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
 */
class UnsupportedGrantTypeError extends OAuthError {
  constructor(message = '', properties) {
    super(message, {
      code: 400,
      name: 'unsupported_grant_type',
      ...properties,
    });
  }
}

module.exports = UnsupportedGrantTypeError
