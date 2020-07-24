/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const debugService = require('@hgc-ab/debug-service')('authenticateHandler')
const {
  InsufficientScopeError,
  InvalidArgumentError,
  InvalidTokenError,
  ServerError,
} = require('../../errors')

const Request = require('../../request')
const Response = require('../../response')
const AuthenticateRequest = require('./authenticate-request')
const AuthenticateResponse = require('./authenticate-response')

/**
 * Provides an implementation of the specification:
 * - The OAuth 2.0 Authorization Framework: Bearer Token Usage [RFC6750]
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6750
 */
class AuthenticateHandler {
  /**
   * Create a authentication handler instance
   *
   * @param {Object|*} model - The data access model
   * @param {Function} model.getAccessToken - Get the access token
   * @param {Function} [model.verifyScope] - Verify scope
   * @param {Object} options - Optional settings
   * @param {String} options.scope - The scope to verify
   * @param {Boolean} options.addAcceptedScopesHeader - Set the X-Accepted-OAuth-Scopes HTTP header on response objects.
   * @param {Boolean} options.addAuthorizedScopesHeader - Set the X-OAuth-Scopes HTTP header on response objects.
   * @param {Boolean} options.allowBearerTokensInQueryString - Allow clients to pass bearer tokens in the query string of a request
   */
  constructor(
    model,
    options = {
      scope: undefined,
      addAcceptedScopesHeader: true,
      addAuthorizedScopesHeader: true,
      allowBearerTokensInQueryString: false,
    }
  ) {
    if (!model) {
      throw new InvalidArgumentError('Missing parameter: `model`')
    }

    if (!model.getAccessToken) {
      throw new InvalidArgumentError(
        'Invalid argument: model does not implement `getAccessToken()`'
      )
    }

    if (options.scope && !model.verifyScope) {
      throw new InvalidArgumentError('Invalid argument: model does not implement `verifyScope()`')
    }

    this.addAcceptedScopesHeader = options.addAcceptedScopesHeader
    this.addAuthorizedScopesHeader = options.addAuthorizedScopesHeader
    this.allowBearerTokensInQueryString = options.allowBearerTokensInQueryString

    /**
     * The data access model
     * @type {{getAccessToken: Function, verifyScope?: Function}|*}
     */
    this.model = model

    /**
     * Authentication scope
     * @type {String}
     */
    this.scope = options.scope
  }

  /**
   * Validate the access token
   *
   * @param {String} token - Authenticate request instance
   * @return {Promise<{Object}>} - The access token from the data model
   * @throws {InvalidTokenError|ServerError}
   */
  async validateAccessToken(token) {
    debugService('validateAccessToken:', token)
    const now = new Date()
    const accessToken = await this.model.getAccessToken(token)
    if (!accessToken) {
      throw new InvalidTokenError('Invalid token: access token is invalid')
    }

    if (!accessToken.user) {
      throw new ServerError('Server error: `getAccessToken()` did not return a `user` object')
    }

    if (!(accessToken.accessTokenExpiresAt instanceof Date)) {
      throw new ServerError('Server error: `accessTokenExpiresAt` must be a Date instance')
    }

    if (accessToken.accessTokenExpiresAt.getTime() < now.getTime()) {
      throw new InvalidTokenError('Invalid token: access token has expired')
    }

    return accessToken
  }

  /**
   * Verify authorized access token scope(s) vs authentication scope(s)
   * Invoked during request authentication to check if the provided access token
   * is authorized and valid the the request.
   *
   * @param {Object} accessToken - The access token from the data model
   * @returns {Promise<*>} - The verified scope(s)
   * @throws {InsufficientScopeError}
   */
  async verifyAccessTokenScope(accessToken) {
    debugService('verifyAccessTokenScope:', accessToken, this.scope)
    const scope = await this.model.verifyScope(accessToken, this.scope)
    if (!scope) {
      throw new InsufficientScopeError('Insufficient scope: authorized scope is insufficient')
    }

    return scope
  }


  /**
   * Resource owner verification/authentication process
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @returns {Promise<Object>}
   */
  async execute(request, response) {
    try {
      debugService('started')

      /**
       * Validate request parameters
       * @type {AuthenticateRequest}
       */
      const aRequest = new AuthenticateRequest(request, this.allowBearerTokensInQueryString)

      /**
       * Validate access token
       * @type {Object}
       */
      const accessToken = await this.validateAccessToken(aRequest.token)

      /**
       * Verify authorized access token scope(s) vs authentication scope(s)
       * if authentication endpoint middleware is used
       */
      if (this.scope) {
        await this.verifyAccessTokenScope(accessToken)
      }

      /**
       * Update success response
       */
      new AuthenticateResponse(response).setSuccessResponse(
        accessToken,
        this.scope,
        this.addAcceptedScopesHeader,
        this.addAuthorizedScopesHeader
      )

      /**
       * Return the authenticated user from the authorized access token
       */
      debugService('ended gracefully')
      return accessToken.user

    } catch (e) {
      debugService('execute: ', e.name, e.message)

      /**
       * Update error response
       */
      new AuthenticateResponse(response).setErrorResponse(e)
      throw e
    }
  }
}

module.exports = AuthenticateHandler
