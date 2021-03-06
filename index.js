/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

exports = module.exports = require('./lib/server');
exports.Request = require('./lib/request');
exports.Response = require('./lib/response');

exports.AbstractGrant = require('./lib/grants/abstract-grant');

exports.AccessDeniedError = require('./lib/errors/access-denied');
exports.InsufficientScopeError = require('./lib/errors/insufficient-scope');
exports.InvalidArgumentError = require('./lib/errors/invalid-argument');
exports.InvalidClientError = require('./lib/errors/invalid-client');
exports.InvalidGrantError = require('./lib/errors/invalid-grant');
exports.InvalidRequestError = require('./lib/errors/invalid-request');
exports.InvalidScopeError = require('./lib/errors/invalid-scope');
exports.InvalidTokenError = require('./lib/errors/invalid-token');
exports.OAuthError = require('./lib/errors/oauth-error');
exports.ServerError = require('./lib/errors/server-error');
exports.UnauthorizedClientError = require('./lib/errors/unauthorized-client');
exports.UnauthorizedRequestError = require('./lib/errors/unauthorized-request');
exports.UnsupportedGrantTypeError = require('./lib/errors/unsupported-grant-type');
exports.UnsupportedResponseTypeError = require('./lib/errors/unsupported-response-type');
exports.UnsupportedTokenTypeError = require('./lib/errors/unsupported-token-type');
