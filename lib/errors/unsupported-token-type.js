/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const OAuthError = require('./oauth-error')

/**
 * The token hint type is not supported by the authorization server.
 *
 * @class
 * @see https://tools.ietf.org/html/rfc7009
 */
class UnsupportedTokenTypeError extends OAuthError {
  constructor(message = '', properties) {
    super(message, {
      code: 400,
      name: 'unsupported_token_type',
      ...properties,
    });
  }
}

module.exports = UnsupportedTokenTypeError
