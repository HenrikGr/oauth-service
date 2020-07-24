/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const { InvalidArgumentError } = require('../errors')

/**
 * Model attributes
 * @type {string[]}
 */
const modelAttributes = [
  'accessToken',
  'accessTokenExpiresAt',
  'refreshToken',
  'refreshTokenExpiresAt',
  'scope',
  'client',
  'user',
]

/**
 * TokenModel class
 *
 * @class
 */
class TokenModel {
  /**
   * Create a new token model instance
   * @param data
   * @param options
   */
  constructor(data = {}, options = {}) {
    if (!data.accessToken) {
      throw new InvalidArgumentError('Missing parameter: `accessToken`');
    }

    if (!data.client) {
      throw new InvalidArgumentError('Missing parameter: `client`');
    }

    if (!data.user) {
      throw new InvalidArgumentError('Missing parameter: `user`');
    }

    if (
      data.accessTokenExpiresAt &&
      !(data.accessTokenExpiresAt instanceof Date)
    ) {
      throw new InvalidArgumentError(
        'Invalid parameter: `accessTokenExpiresAt`',
      );
    }

    if (
      data.refreshTokenExpiresAt &&
      !(data.refreshTokenExpiresAt instanceof Date)
    ) {
      throw new InvalidArgumentError(
        'Invalid parameter: `refreshTokenExpiresAt`',
      );
    }

    this.accessToken = data.accessToken;
    this.accessTokenExpiresAt = data.accessTokenExpiresAt;
    this.refreshToken = data.refreshToken;
    this.refreshTokenExpiresAt = data.refreshTokenExpiresAt;
    this.scope = data.scope;
    this.client = data.client;
    this.user = data.user;

    if (options && options.allowExtendedTokenAttributes) {
      this.customAttributes = {};

      for (let key in data) {
        if (data.hasOwnProperty(key) && (modelAttributes.indexOf(key) < 0)) {
          this.customAttributes[key] = data[key];
        }
      }
    }

    if (this.accessTokenExpiresAt) {
      const now = new Date()
      this.accessTokenLifetime = Math.floor((this.accessTokenExpiresAt - now.getTime()) / 1000)
    }
  }
}

module.exports = TokenModel
