/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const OAuthError = require('./oauth-error')

/**
 * The resource owner or authorization server denied the request
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
 */
class AccessDeniedError extends OAuthError {
  constructor(message = '', properties) {
    super(message, { code: 400, name: 'access_denied', ...properties })
  }
}

module.exports = AccessDeniedError
