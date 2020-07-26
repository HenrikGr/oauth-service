/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const debugService = require('@hgc-ab/debug-service')('server')
const { InvalidArgumentError } = require('./errors')
const {
  AuthenticateHandler,
  AuthorizeHandler,
  IntrospectHandler,
  TokenHandler,
  RevokeHandler,
} = require('./handlers')


/**
 * Provides an implementation of the specification
 * - The OAuth 2.0 Authorization Framework [RFC 6749]
 *
 * @class
 * @see https://tools.ietf.org/html/rfc6749
 */
class OAuth2Server {
  /**
   * Create an OAuth 2 server instance
   * @param {Object|*} model - The data access model
   * @param {Object} [options] - optional settings
   */
  constructor(model, options = {}) {
    if (!model) {
      throw new InvalidArgumentError('Missing parameter: `model`')
    }

    /**
     * Authorization endpoint default settings
     */
    this.authorizeOptions = {
      authenticateHandler: undefined,
      accessTokenLifetime: 1800,
      authorizationCodeLifetime: 300,
      allowEmptyState: false,
    }

    /**
     * Authentication protected resource default settings
     */
    this.authenticateOptions = {
      scope: undefined,
      addAcceptedScopesHeader: true,
      addAuthorizedScopesHeader: true,
      allowBearerTokensInQueryString: false,
      // TODO: Fix options for the authorize and authenticate endpoints
      requireClientAuthentication: {
        password: false,
        refresh_token: false
      }
    }

    /**
     * Token endpoint default settings
     */
    this.tokenOptions = {
      accessTokenLifetime: 1800,
      refreshTokenLifetime: 86400,
      allowExtendedTokenAttributes: false,
      requireClientAuthentication: { password: true, refresh_token: true },
      alwaysIssueNewRefreshToken: true,
      extendedGrantTypes: {},
    }

    this.introspectOptions = {
      isClientSecretRequired: true
    }

    this.revokeOptions = {
      isClientSecretRequired: true
    }


    /**
     * The data access model
     * @type {Object|*}
     */
    this.model = model
  }

  /**
   * Function that filer out undefined options passed
   * in from the middleware function and convert 'true'
   * and 'false' strings to true and false
   * @param options
   * @returns {{}}
   */
  cleanOptions(options) {
    return Object.keys(options).reduce((acc, key) => {
      if (options[key] !== undefined) {
        acc[key] = options[key];

        if('' + options[key] === 'true') {
          acc[key] = true
        }

        if('' + options[key] === 'false') {
          acc[key] = false
        }
      }
      return acc;
    }, {})
  }

  /**
   * Authenticate a protected resource by a token
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @param {Object} options - Options to override endpoint default settings
   * @returns {Promise<boolean|Object>}
   */
  async authenticate(request, response, options) {
    const scope = options === 'string' ? { scope: options } : options
    const opts = {
      ...this.authenticateOptions,
      ...scope,
    }

    debugService('authenticate: ', opts)
    return new AuthenticateHandler(this.model, opts).execute(request, response)
  }

  /**
   * Authorize a token request
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @param {Object} options - Options to override endpoint default settings
   * @returns {Promise<*>}
   */
  async authorize(request, response, options) {
    const cleanOpts = this.cleanOptions(options)
    const opts = {
      ...this.authorizeOptions,
      ...this.authenticateOptions,
      ...cleanOpts,
    }

    return new AuthorizeHandler(this.model, opts).execute(request, response)
  }

  /**
   * Retrieves a new token for an authorized token request
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @param {Object} options - Options to override endpoint default settings
   * @returns {Promise<*>}
   */
  async token(request, response, options) {
    const cleanOpts = this.cleanOptions(options)
    const opts = {
      ...this.tokenOptions,
      ...cleanOpts,
    }

    return new TokenHandler(this.model, opts).execute(request, response)
  }

  /**
   * Introspect a token
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @param {Object} options - Options to override endpoint default settings
   * @returns {Promise<*>}
   */
  async introspect(request, response, options) {
    const cleanOpts = this.cleanOptions(options)
    const opts = {
      ...this.introspectOptions,
      ...cleanOpts,
    }

    return new IntrospectHandler(this.model, opts).execute(request, response)
  }

  /**
   * Revoke token
   *
   * @param {Request} request - The OAuth 2 server request object
   * @param {Response} response - The OAuth 2 server response object
   * @param {Object} options - Options to override endpoint default settings
   * @return {Promise<void>}
   */
  async revoke(request, response, options) {
    const cleanOpts = this.cleanOptions(options)
    const opts = {
      ...this.revokeOptions,
      ...cleanOpts,
    }

    return new RevokeHandler(this.model, opts).execute(request, response)
  }
}

module.exports = OAuth2Server
