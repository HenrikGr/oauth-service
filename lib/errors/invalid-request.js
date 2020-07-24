/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const OAuthError = require('./oauth-error')

/**
 * The request is missing a required parameter, includes an invalid parameter value,
 * includes a parameter more than once, or is otherwise malformed.
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-4.2.2.1
 */
class InvalidRequestError extends OAuthError {
  constructor(message = '', properties) {
    super(message, { code: 400, name: 'invalid_request', ...properties });
  }
}

module.exports = InvalidRequestError
