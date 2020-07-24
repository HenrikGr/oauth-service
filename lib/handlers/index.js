/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const AuthenticateHandler = require('./authenticate/authenticate-handler')
const AuthorizeHandler = require('./auhtorize/authorize-handler')
const TokenHandler  = require('./token/token-handler')
const IntrospectHandler = require('./introspect/introspect-handler')
const RevokeHandler = require('./revoke/revoke-handler')

module.exports = {
  AuthenticateHandler,
  AuthorizeHandler,
  TokenHandler,
  IntrospectHandler,
  RevokeHandler,
}
