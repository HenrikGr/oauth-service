/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

exports = module.exports = require('./server')

exports.Request = require('./request')
exports.Response = require('./response')

exports.AbstractGrant = require('./grants/abstract-grant')

exports.AccessDeniedError = require('./errors/access-denied')
exports.InsufficientScopeError = require('./errors/insufficient-scope')
exports.InvalidArgumentError = require('./errors/invalid-argument')
exports.InvalidClientError = require('./errors/invalid-client')
exports.InvalidGrantError = require('./errors/invalid-grant')
exports.InvalidRequestError = require('./errors/invalid-request')
exports.InvalidScopeError = require('./errors/invalid-scope')
exports.InvalidTokenError = require('./errors/invalid-token')
exports.OAuthError = require('./errors/oauth-error')
exports.ServerError = require('./errors/server-error')
exports.UnauthorizedClientError = require('./errors/unauthorized-client')
exports.UnauthorizedRequestError = require('./errors/unauthorized-request')
exports.UnsupportedGrantTypeError = require('./errors/unsupported-grant-type')
exports.UnsupportedResponseTypeError = require('./errors/unsupported-response-type')
exports.UnsupportedTokenTypeError = require('./errors/unsupported-token-type')
