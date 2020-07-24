/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const OAuthError = require('./oauth-error')

/**
 * The request requires valid argument.
 *
 * @class
 */
class InvalidArgumentError extends OAuthError {
  constructor(message = '', properties) {
    super(message, { code: 500, name: 'invalid_argument', ...properties });
  }
}

module.exports = InvalidArgumentError
