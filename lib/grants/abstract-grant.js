/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const { InvalidArgumentError, InvalidScopeError } = require('../errors')
const tokenUtil = require('../utils/token')
const is = require('../validator/is')


/**
 * Abstract grant class
 *
 * @class
 */
class AbstractGrant {
  /**
   * Create a new abstract grant instance
   *
   * @param {Object} model
   * @param {Object} options
   * @param {Number} options.accessTokenLifetime
   * @param {Number} options.refreshTokenLifetime
   * @param {Boolean} options.alwaysIssueNewRefreshToken
   * @param {Boolean} options.allowExtendedTokenAttributes
   */
  constructor(model, options = {
    accessTokenLifetime: 1800,
    refreshTokenLifetime: 86400,
    alwaysIssueNewRefreshToken: true,
    allowExtendedTokenAttributes: false,
  }) {
    if (!options.accessTokenLifetime) {
      throw new InvalidArgumentError(
        'Missing parameter: `accessTokenLifetime`',
      );
    }

    if (!model) {
      throw new InvalidArgumentError('Missing parameter: `model`');
    }

    this.model = model;
    this.accessTokenLifetime = options.accessTokenLifetime
    this.refreshTokenLifetime = options.refreshTokenLifetime
    this.alwaysIssueNewRefreshToken = options.alwaysIssueNewRefreshToken
    this.allowExtendedTokenAttributes = options.allowExtendedTokenAttributes
  }

  /**
   * Generate access token.
   *
   * @param client
   * @param user
   * @param scope
   * @returns {Promise<string|any>}
   */
  async generateAccessToken(client, user, scope) {
    if (this.model.generateAccessToken) {
      const token = await this.model.generateAccessToken(client, user, scope);
      return token ? token : tokenUtil.generateRandomToken();
    }

    return tokenUtil.generateRandomToken();
  }

  /**
   * Generate refresh token.
   *
   * @param client
   * @param user
   * @param scope
   * @returns {Promise<string|any>}
   */
  async generateRefreshToken(client, user, scope) {
    if (this.model.generateRefreshToken) {
      const token = await this.model.generateRefreshToken(client, user, scope);
      return token ? token : tokenUtil.generateRandomToken();
    }

    return tokenUtil.generateRandomToken();
  }

  /**
   * Set access token expiration date by using epoch time in UTC
   *
   * @returns {Date}
   */
  setAccessTokenExpiresAt() {
    const now = new Date()
    return new Date(now.getTime() + this.accessTokenLifetime * 1000)
  }

  /**
   * Set access token expiration date by using epoch time in UTC
   *
   * @returns {Date}
   */
  setRefreshTokenExpiresAt() {
    const now = new Date()
    return new Date(now.getTime() + this.refreshTokenLifetime * 1000)
  }

  /**
   * Get scope from the request body.
   *
   * @param request
   * @returns {*}
   */
  getScope(request) {
    if (!is.nqschar(request.body.scope)) {
      throw new InvalidArgumentError('Invalid parameter: `scope`');
    }
    return request.body.scope;
  }

  /**
   * Validate requested scope.
   *
   * @param client
   * @param user
   * @param scope
   * @returns {Promise<String|string|*>}
   */
  async validateScope(client, user, scope) {
    if (this.model.validateScope) {
      const validatedScope = await this.model.validateScope(client, user, scope)
      if (!validatedScope) {
        throw new InvalidScopeError('Invalid scope: Requested scope is invalid');
      }
      return validatedScope;
    }

    return scope;
  }

}


module.exports = AbstractGrant
