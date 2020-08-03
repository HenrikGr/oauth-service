/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described
 * and found in the LICENSE file in the root directory of this source tree.
 */

const { InvalidArgumentError, InvalidClientError } = require('../../errors')
const IntrospectRequest = require('./introspect-request')
const IntrospectResponse = require('./introspect-response')
const {  log, error } = require('@hgc-ab/debug-service')('oauth:introspectHandler')

/**
 * Provides an implementation of the specification:
 * - OAuth 2.0 Token Introspection - [RFC 7662]
 *
 * @class
 * @see https://tools.ietf.org/html/rfc7662
 */
class IntrospectHandler {
  /**
   * Create an introspection handler instance
   *
   * @param {Object|*} model - The data access model
   * @param {Function} model.getClient - get client by id and secret
   * @param {Function} model.getAccessToken - get access token
   * @param {Function} model.getRefreshToken - get refresh token
   * @param {Object} options - optional settings
   * @param {Boolean} options.isClientSecretRequired - authenticate with client secret
   */
  constructor(model, options = { isClientSecretRequired: true }) {
    if (!model) {
      throw new InvalidArgumentError('Missing parameter: `model`')
    }

    if (!model.getClient) {
      throw new InvalidArgumentError('Invalid argument: model does not implement `getClient()`')
    }

    if (!model.getAccessToken) {
      throw new InvalidArgumentError(
        'Invalid argument: model does not implement `getAccessToken()`'
      )
    }

    if (!model.getRefreshToken) {
      throw new InvalidArgumentError(
        'Invalid argument: model does not implement `getRefreshToken()`'
      )
    }

    /**
     * Is client secret required when authenticating the client
     * @type {boolean}
     */
    this.isClientSecretRequired = options.isClientSecretRequired

    /**
     * The data access model
     * @type {{getRefreshToken}|{getAccessToken}|{getClient}|*}
     */
    this.model = model
  }

  /**
   * Authenticate client
   *
   * TODO: Validate client secret based on client type
   * A confidential client must have the secret and the
   * isClientSecretRequired can not be false.
   * Is client type in the request or should it be in the client data?
   *
   * @returns {Promise<{Object}|boolean>} - The authenticated client
   * @throws {InvalidClientError}
   */
  async authenticateClient(credentials) {
    log('authenticateClient:', credentials.clientId)
    const client = await this.model.getClient(credentials.clientId, credentials.clientSecret)
    if (!client) {
      throw new InvalidClientError('Invalid client: client is invalid')
    }

    return client
  }


  /**
   * Verify whether the token was issued to the client making the revocation request
   *
   * @param {IntrospectRequest} introspectRequest - The introspect request
   * @param {Object} client - The authenticated client
   * @return {Promise<*|boolean>}
   */
  async verifyToken(introspectRequest, client) {
    log('verifyToken:', introspectRequest.tokenHint)
    const token =
      introspectRequest.tokenHint === 'access_token'
        ? await this.model.getAccessToken(introspectRequest.token)
        : await this.model.getRefreshToken(introspectRequest.token)

    return (token && token.client.id === client.id) ? token : false
  }

  /**
   * Compose introspection result
   *
   * @param {IntrospectRequest} introspectRequest - The introspect request object
   * @param {Object} token - The token
   * @returns {Object}|{active: boolean}}
   */
  composeIntrospectResult(introspectRequest, token) {
    log('composeIntrospectResult:', introspectRequest.tokenHint)

    // Token not verified
    if (!token) {
      return {
        active: false
      }
    } else {
      const now = new Date()
      const expiresAt =
        introspectRequest.tokenHint === 'access_token'
          ? token.accessTokenExpiresAt
          : token.refreshTokenExpiresAt

      // noinspection JSUnresolvedFunction
      const hasExpired = now.getTime() > expiresAt.getTime()

      if (hasExpired) {
        return {
          active: false,
        }
      }

      return {
        active: true,
        client_id: token.client.id,
        username: token.user.username,
        scope: token.scope,
        expires_at: expiresAt,
      }
    }
  }

  /**
   * Manage the introspection flow
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @return {Promise<void>}
   */
  async execute(request, response) {
    try {

      log('started')

      /**
       * Validate request params
       * @type {IntrospectRequest}
       */
      const introspectRequest = new IntrospectRequest(request, this.isClientSecretRequired)

      /**
       * Authenticate client
       */
      const client = await this.authenticateClient(introspectRequest.credentials)

      /**
       * Verify whether the token was issued to the client making the revocation request
       */
      const token = await this.verifyToken(introspectRequest, client)

      /**
       * Compose introspection result
       */
      const result = this.composeIntrospectResult(introspectRequest, token)

      /**
       * Update success response
       */
      new IntrospectResponse(response).setSuccessResponse(result)
      log('ended gracefully')
    } catch (e) {
      error('execute:', e.name, e.message)

      /**
       * Update error response
       */
      const isAuthorizationHeader = request.get('authorization')
      new IntrospectResponse(response).setErrorResponse(e, isAuthorizationHeader)

      throw e
    }
  }
}

module.exports = IntrospectHandler
