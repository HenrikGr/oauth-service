/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const { InvalidArgumentError } = require('../errors')
const { hasOwnProperty } = require('../utils/fn')

/**
 * BearerToken class
 *
 * @class
 */
class BearerToken {
  /**
   * Create a new bearer token instance
   *
   * @param {String} accessToken
   * @param {Number} accessTokenLifetime
   * @param {String} [refreshToken]
   * @param {String} scope
   * @param {*} customAttributes
   */
  constructor(accessToken, accessTokenLifetime, refreshToken, scope, customAttributes) {
    if (!accessToken) {
      throw new InvalidArgumentError('Missing parameter: `accessToken`');
    }

    this.accessToken = accessToken;
    this.accessTokenLifetime = accessTokenLifetime;
    this.refreshToken = refreshToken;
    this.scope = scope;

    if (customAttributes) {
      this.customAttributes = customAttributes;
    }
  }

  /**
   * Retrieve the value representation.
   *
   * @returns {{access_token: String, token_type: string}}
   */
  valueOf() {
    const object = {
      access_token: this.accessToken,
      token_type: 'Bearer',
    };

    if (this.accessTokenLifetime) {
      object.expires_in = this.accessTokenLifetime;
    }

    if (this.refreshToken) {
      object.refresh_token = this.refreshToken;
    }

    if (this.scope) {
      object.scope = this.scope;
    }

    for (const key of Object.keys(this.customAttributes || {})) {
      if (hasOwnProperty(this.customAttributes, key)) {
        object[key] = this.customAttributes[key];
      }
    }

    return object;
  }
}

module.exports = BearerToken
