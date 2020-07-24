/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const OAuthError = require('./oauth-error')

/**
 * The authorization server encountered an unexpected condition that
 * prevented it from fulfilling the request.
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
 */
class ServerError extends OAuthError {
  constructor(message = '', properties) {
    super(message, { code: 500, name: 'server_error', ...properties });
  }
}

module.exports = ServerError
