/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const  AccessDeniedError = require('./access-denied')
const  InsufficientScopeError = require('./insufficient-scope')
const  InvalidArgumentError = require('./invalid-argument')
const  InvalidClientError = require('./invalid-client')
const  InvalidGrantError = require('./invalid-grant')
const  InvalidRequestError = require('./invalid-request')
const  InvalidScopeError = require('./invalid-scope')
const  InvalidTokenError = require('./invalid-token')
const  OAuthError = require('./oauth-error')
const  ServerError = require('./server-error')
const  UnauthorizedClientError = require('./unauthorized-client')
const  UnauthorizedRequestError = require('./unauthorized-request')
const  UnsupportedGrantTypeError = require('./unsupported-grant-type')
const  UnsupportedResponseTypeError = require('./unsupported-response-type')
const  UnsupportedTokenTypeError = require('./unsupported-token-type')

module.exports = {
  AccessDeniedError,
  InsufficientScopeError,
  InvalidArgumentError,
  InvalidClientError,
  InvalidGrantError,
  InvalidRequestError,
  InvalidScopeError,
  InvalidTokenError,
  OAuthError,
  ServerError,
  UnauthorizedClientError,
  UnauthorizedRequestError,
  UnsupportedGrantTypeError,
  UnsupportedResponseTypeError,
  UnsupportedTokenTypeError,
}
