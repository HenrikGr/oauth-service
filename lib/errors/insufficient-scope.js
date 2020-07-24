/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const OAuthError = require('./oauth-error')

/**
 * The request requires higher privileges than provided by the access token.
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6750.html#section-3.1
 */
class InsufficientScopeError extends OAuthError {
  constructor(message = '', properties) {
    super(message, { code: 403, name: 'insufficient_scope', ...properties });
  }
}

module.exports = InsufficientScopeError
