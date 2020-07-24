/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const debugService = require('@hgc-ab/debug-service')('authorizeHandler')
const AuthenticateHandler = require('../authenticate/authenticate-handler')
const {
  InvalidArgumentError,
  InvalidClientError,
  InvalidScopeError,
  ServerError,
  UnauthorizedClientError,
} = require('../../errors')

const AuthorizationRequest = require('./authorization-request')
const AuthorizationResponse = require('./authorization-response')

const CodeResponse = require('./response-types/code-response')
const TokenResponse = require('./response-types/token-response')


/**
 * Provides an implementation of the authorization endpoint
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-3.1
 */
class AuthorizeHandler {
  /**
   * Create a new authorization handler instance
   *
   * @param {Object|*} model - The data access model
   * @param {Function} model.getClient - Get client
   * @param {Object} options - Optional settings for the token handler
   */
  constructor(
    model,
    options = {
      authenticateHandler: undefined,
      accessTokenLifetime: 1800,
      authorizationCodeLifetime: 300,
      allowEmptyState: false,
      // Authenticate options
      scope: undefined,
      addAcceptedScopesHeader: true,
      addAuthorizedScopesHeader: true,
      allowBearerTokensInQueryString: false,
    }
  ) {

    if (options.authenticateHandler && !options.authenticateHandler.execute) {
      throw new InvalidArgumentError(
        'Invalid argument: authenticateHandler does not implement `execute()`'
      )
    }

    if (!model) {
      throw new InvalidArgumentError('Missing parameter: `model`')
    }

    if (!model.getClient) {
      throw new InvalidArgumentError('Invalid argument: model does not implement `getClient()`')
    }

    /**
     * The data access model
     * @type {{getClient: Function}|*}
     */
    this.model = model

    /**
     * Access token life time
     * @type {number}
     */
    this.accessTokenLifetime = options.accessTokenLifetime

    /**
     * Authorization code lifetime
     * @type {number}
     */
    this.authorizationCodeLifetime = options.authorizationCodeLifetime

    /**
     * Allow empty state flag
     * @type {boolean}
     */
    this.allowEmptyState = options.allowEmptyState

    /**
     * Authentication options - used to authenticate the resource owner
     */
    this.authenticateOptions = {
      scope: options.scope,
      addAcceptedScopesHeader: options.addAcceptedScopesHeader,
      addAuthorizedScopesHeader: options.addAuthorizedScopesHeader,
      allowBearerTokensInQueryString: options.allowBearerTokensInQueryString,
    }

    /**
     * Authenticate handler to authenticate the resource owner
     * @type {AuthenticateHandler}
     */
    this.authenticateHandler =
      options.authenticateHandler || new AuthenticateHandler(model, this.authenticateOptions)
  }


  /**
   * Authenticate the resource owner
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @return {Promise<Object>}
   * @throws {ServerError}
   * @see https://tools.ietf.org/html/rfc6750
   */
  async authenticateResourceOwner(request, response) {
    debugService('authenticateResourceOwner')
    if (this.authenticateHandler instanceof AuthenticateHandler) {
      const user = await this.authenticateHandler.execute(request, response)
      if (!user) {
        throw new ServerError('Server error: `authenticateHandler` did not return a `user` object')
      }

      return user
    }

    const user = await this.authenticateHandler.execute(request, response)
    if (!user) {
      throw new ServerError('Server error: `authenticateHandler` did not return a `user` object')
    }

    return user
  }


  /**
   * Validate client
   *
   * @param {AuthorizationRequest} authorizationRequest - The authorization request object
   * @return {Promise<Object>}
   * @throws {InvalidClientError|UnauthorizedClientError}
   */
  async validateClient(authorizationRequest) {
    debugService('validateClient:', authorizationRequest.clientId)
    const client = await this.model.getClient(authorizationRequest.clientId)
    if (!client) {
      throw new InvalidClientError('Invalid client: client credentials are invalid')
    }

    /**
     * Validate grants
     */

    if (!client.grants) {
      throw new InvalidClientError('Invalid client: missing client `grants`')
    }

    if (authorizationRequest.responseType === 'code' && !client.grants.includes('authorization_code')) {
      throw new UnauthorizedClientError('Unauthorized client: `grant_type` is invalid')
    }

    if (authorizationRequest.responseType === 'token' && !client.grants.includes('implicit')) {
      throw new UnauthorizedClientError('Unauthorized client: `grant_type` is invalid')
    }

    /**
     * Validate redirect uri
     */

    if (!client.redirectUris || client.redirectUris.length === 0) {
      throw new InvalidClientError('Invalid client: missing client `redirectUri`')
    }

    if (authorizationRequest.redirectUri && !client.redirectUris.includes(authorizationRequest.redirectUri)) {
      throw new InvalidClientError('Invalid client: `redirect_uri` does not match client value')
    }

    return client
  }

  /**
   * Validate scope
   *
   * @param {AuthorizationRequest} authorizationRequest - The authorization request object
   * @param {Object} user - The authenticated resource owner
   * @param {Object} client - The validated client object
   * @return {Promise<String|string|*>}
   * @see https://tools.ietf.org/html/rfc6749#section-3.3
   */
  async validateScope(authorizationRequest, user, client) {
    debugService('validateScope:', authorizationRequest.scope)
    if (this.model.validateScope) {
      const validScope = await this.model.validateScope(user, client, authorizationRequest.scope)
      if (!validScope) {
        throw new InvalidScopeError('Invalid scope: Requested scope is invalid')
      }

      return validScope
    }

    return authorizationRequest.scope
  }

  /**
   * Process the first step in the authorization flow
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @returns {Promise<*>}
   */
  async execute(request, response) {
    try {
      debugService('started')

      /**
       * Validate authorization request parameters
       * @type {AuthorizationRequest}
       */
      const authorizationRequest = new AuthorizationRequest(request, this.allowEmptyState)

      /**
       * Authenticate the resource owner
       * @type {Object}
       */
      const user = await this.authenticateResourceOwner(request, response)

      /**
       * Validate the client, response type and redirect uri
       * @type {Object}
       */
      const client = await this.validateClient(authorizationRequest)

      /**
       * Validating scope
       * @type {String|string|*}
       */
      const validScope = await this.validateScope(authorizationRequest, user, client)

      /**
       * Create either a CodeResponse or a TokenResponse instance
       */
      const responseType =
        authorizationRequest.responseType === 'code'
          ? new CodeResponse(this.model, { authorizationCodeLifetime: this.authorizationCodeLifetime })
          : new TokenResponse(this.model, { accessTokenLifetime: this.accessTokenLifetime })

      /**
       * Process the response type
       * @type {UrlWithStringQuery}
       */
      const redirectUri = await responseType.execute(
        client,
        user,
        validScope,
        authorizationRequest.redirectUri,
        authorizationRequest.state
      )

      /**
       * Update authorization response
       */
      new AuthorizationResponse(response).setSuccessResponse(redirectUri)
      debugService('ended gracefully')
    } catch (e) {
      debugService('execute:', e.name, e.message)

      /**
       * Update authorization response
       */
      const uri = request.body.redirect_uri || request.query.redirect_uri
      new AuthorizationResponse(response).setErrorResponse(e, uri)
      throw e
    }
  }
}

module.exports = AuthorizeHandler
