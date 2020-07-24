/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const crypto = require('crypto')

/**
 * Generate random token.
 *
 * @returns {string} - token string
 */
function generateRandomToken() {
  try {
    return crypto
      .createHash('sha1')
      .update(crypto.randomBytes(256))
      .digest('hex')
  } catch(e) {
    throw e
  }
}

module.exports = {
  generateRandomToken
}
