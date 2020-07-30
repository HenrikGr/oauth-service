/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described
 * and found in the LICENSE file in the root directory of this source tree.
 */

const { InvalidArgumentError, InvalidClientError } = require('../../errors')
const RevokeRequest = require('./revoke-request')
const RevokeResponse = require('./revoke-response')
const debugService = require('@hgc-ab/debug-service')('oauth:revokeHandler')

/**
 * Provides an implementation of the specification:
 * - OAuth 2.0 Token Revocation - [RFC 7009]
 *
 * @class
 * @see https://tools.ietf.org/html/rfc7009
 */
class RevokeHandler {
  /**
   * Create an introspection handler instance
   *
   * @param {Object|*} model - The data access model
   * @param {Function} model.getClient - get client by id and secret
   * @param {Function} model.getAccessToken - get access token
   * @param {Function} model.getRefreshToken - get refresh token
   * @param {Function} model.revokeAccessToken - revoke access token
   * @param {Function} model.revokeRefreshToken - revoke refresh token
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

    if (!model.revokeAccessToken) {
      throw new InvalidArgumentError(
        'Invalid argument: model does not implement `revokeAccessToken()`'
      )
    }

    if (!model.revokeRefreshToken) {
      throw new InvalidArgumentError(
        'Invalid argument: model does not implement `revokeRefreshToken()`'
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
    debugService('authenticateClient:', credentials.clientId)
    const client = await this.model.getClient(credentials.clientId, credentials.clientSecret)
    if (!client) {
      throw new InvalidClientError('Invalid client: client is invalid')
    }

    return client
  }

  /**
   * Verify whether the token was issued to the client making the revocation request
   *
   * @param {RevokeRequest} revokeRequest - The revocation request
   * @param {Object} client - The authenticated client
   * @return {Promise<*|boolean>}
   */
  async verifyToken(revokeRequest, client) {
    debugService('verifyToken:', revokeRequest.tokenHint)
    const token =
      revokeRequest.tokenHint === 'access_token'
        ? await this.model.getAccessToken(revokeRequest.token)
        : await this.model.getRefreshToken(revokeRequest.token)

    return (token && token.client.id === client.id) ? token : false
  }

  /**
   * Invalidate the token
   *
   * @param {RevokeRequest} revokeRequest - The revocation request
   * @param token
   * @return {Promise<void>}
   */
  async invalidateToken(revokeRequest, token) {
    debugService('invalidateToken: ', revokeRequest.tokenHint)
    return revokeRequest.tokenHint === 'access_token'
        ? await this.model.revokeAccessToken(token)
        : await this.model.revokeRefreshToken(token)
  }

  /**
   * Manage the revoke token flow
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @return {Promise<void>}
   */
  async execute(request, response) {
    try {

      debugService('started')

      /**
       * Validate request params
       * @type {RevokeRequest}
       */
      const revokeRequest = new RevokeRequest(request, this.isClientSecretRequired)

      /**
       * Authenticate client
       */
      const client = await this.authenticateClient(revokeRequest.credentials)

      /**
       * Verify whether the token was issued to the client making the revocation request
       */
      const token = await this.verifyToken(revokeRequest, client)

      /**
       * Invalidate the token if verified
       */
      if (token) {
        await this.invalidateToken(revokeRequest, token)
      }

      /**
       * Update success response
       */
      new RevokeResponse(response).setSuccessResponse()
      debugService('ended gracefully')
    } catch (e) {
      debugService('execute:', e.name, e.message)

      /**
       * Update error response
       */
      const isAuthorizationHeader = request.get('authorization')
      new RevokeResponse(response).setErrorResponse(e, isAuthorizationHeader)

      throw e
    }
  }
}

module.exports = RevokeHandler
