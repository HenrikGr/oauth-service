/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const debugService = require('@hgc-ab/debug-service')('oauth:tokenHandler')
const {
  InvalidArgumentError,
  InvalidClientError,
  ServerError,
  UnauthorizedClientError,
} = require('../../errors')

const TokenRequest = require('./token-request')
const TokenResponse = require('./token-response')

/**
 * Supported grant types
 */
const grantTypes = {
  authorization_code: require('../../grants/authorization-code/authorization-code-grant'),
  client_credentials: require('../../grants/client-credentials/client-credential-grant'),
  password: require('../../grants/password/password-grant'),
  refresh_token: require('../../grants/refresh-token/refresh-token-grant'),
}

/**
 * Provides an implementation of the token endpoint
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749#section-3.2
 */
class TokenHandler {
  /**
   * Create a new token handler instance
   *
   * @param {Object|*} model - The data access model
   * @param {Function} model.getClient - Get client
   * @param {Object} options - Optional settings
   */
  constructor(
    model,
    options = {
      accessTokenLifetime: 1800,
      refreshTokenLifetime: 86400,
      alwaysIssueNewRefreshToken: true,
      requireClientAuthentication: { password: true, refresh_token: true },
      allowExtendedTokenAttributes: false,
      extendedGrantTypes: {},
    }
  ) {
    if (!model) {
      throw new InvalidArgumentError('Missing parameter: `model`')
    }

    if (!model.getClient) {
      throw new InvalidArgumentError('Invalid argument: model does not implement `getClient()`')
    }

    /**
     * Access token lifetime
     * @type {number}
     */
    this.accessTokenLifetime = options.accessTokenLifetime

    /**
     * Refresh token lifetime
     * @type {number}
     */
    this.refreshTokenLifetime = options.refreshTokenLifetime

    /**
     * Allow extended token attributes
     * @type {boolean}
     */
    this.allowExtendedTokenAttributes = options.allowExtendedTokenAttributes

    /**
     * Require client authentication
     * @type {{refresh_token: boolean, password: boolean}}
     */
    this.requireClientAuthentication = options.requireClientAuthentication

    /**
     * Always issue new refresh token
     * @type {boolean}
     */
    this.alwaysIssueNewRefreshToken = options.alwaysIssueNewRefreshToken

    /**
     * Supported grant types
     * @type {{refresh_token: RefreshTokenGrant, client_credentials: ClientCredentialGrant, password: PasswordGrant, authorization_code: AuthorizationCodeGrant}}
     */
    this.grantTypes = { ...grantTypes, ...options.extendedGrantTypes }

    /**
     * Supported grants as array
     * @type {string[]}
     */
    this.allowedGrants = Object.keys(this.grantTypes)

    /**
     * The data access model
     * @type {{getClient: Function}|*}
     */
    this.model = model
  }

  /**
   * Authenticate client
   *
   * @param {TokenRequest} tokenRequest - The token handler request object
   * @returns {Promise<Object>} - The authenticated client
   * @throws {InvalidClientError|UnauthorizedClientError|ServerError|Error}
   */
  async authenticateClient(tokenRequest) {
    debugService('authenticateClient: ', tokenRequest.credentials.clientId)
    const { clientId, clientSecret } = tokenRequest.credentials
    const client = await this.model.getClient(clientId, clientSecret)
    if (!client) {
      throw new InvalidClientError('Invalid client: client is invalid')
    }

    if (!client.grants) {
      throw new ServerError('Server error: missing client `grants`')
    }

    if (!(client.grants instanceof Array)) {
      throw new ServerError('Server error: `grants` must be an array')
    }

    if (!client.grants.includes(tokenRequest.grantType)) {
      throw new UnauthorizedClientError('Unauthorized client: `grant_type` is invalid')
    }

    return client
  }

  /**
   * Process the requested grant
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @param {Object} client - The authenticated client
   * @param {String} grantType - The requested grant type
   * @returns {Promise<Object>}
   */
  async processGrant(request, response, client, grantType) {
    debugService('processGrant: ', grantType)
    const GrantType = this.grantTypes[grantType]

    const options = {
      accessTokenLifetime: client.accessTokenLifetime || this.accessTokenLifetime,
      refreshTokenLifetime: client.refreshTokenLifetime || this.refreshTokenLifetime,
      alwaysIssueNewRefreshToken: this.alwaysIssueNewRefreshToken,
      allowExtendedTokenAttributes: this.allowExtendedTokenAttributes,
    }

    return new GrantType(this.model, options).execute(request, response, client)
  }

  /**
   * Process the token endpoint logic
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @return {Promise<void>}
   */
  async execute(request, response) {
    try {
      debugService('execute: started')

      /**
       * Validate request parameters
       * @type {TokenRequest}
       */
      const tokenRequest = new TokenRequest(request, this.allowedGrants, this.requireClientAuthentication)

      /**
       * Authenticate the client
       * @type {Object}
       */
      const client = await this.authenticateClient(tokenRequest)

      /**
       * Process the requested grant with the authenticated client
       * @type {Object}
       */
      const accessToken = await this.processGrant(request, response, client, tokenRequest.grantType)

      /**
       * Update token response
       */
      new TokenResponse(response).setSuccessResponse(accessToken)
      debugService('execute: ended gracefully')
    } catch (e) {
      debugService('execute: ', e.name, e.message)

      /**
       * Update token response
       */
      const isAuthorizationHeader = request.get('authorization')
      new TokenResponse(response).setErrorResponse(e, isAuthorizationHeader)

      throw e
    }
  }
}

module.exports = TokenHandler
