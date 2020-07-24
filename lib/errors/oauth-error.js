/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Returns status messages for know status codes
 * or status code for known messages
 * @type {status}
 */
const statuses = require('statuses')

/**
 * Base class for all errors returned by this module.
 *
 * @example
 *
 * // Default error
 * const err = new OAuthError();
 * err.message === 'Internal Server Error'
 * err.code === 500
 * err.name === 'OAuthError'
 *
 * const err = new OAuthError('test', {name: 'test_error'});
 * err.message === 'test'
 * err.code === 500
 * err.name === 'test_error'
 *
 * const err = new OAuthError(undefined, {code: 404});
 * err.message === 'Not Found'
 * err.code === 404
 * err.name === 'OAuthError'
 *
 * @class
 */
class OAuthError extends Error {
  /**
   * Create a new instance
   *
   * @param {String|Error} messageOrError
   * @param {Object} properties
   */
  constructor(messageOrError, properties = {}) {
    super()
    let message = messageOrError instanceof Error ? messageOrError.message : messageOrError;
    const error = messageOrError instanceof Error ? messageOrError : undefined;
    let props = properties;
    props.code = props.code || 500; // default code 500

    if (error) {
      props.inner = error;
    }

    // Get standard message for an error code
    if (!message) {
      message = statuses[props.code];
    }

    this.code = this.status = this.statusCode = props.code;
    this.message = message;

    const ignoreAttr = ['code', 'message'];
    Object.keys(props)
      .filter(key => !ignoreAttr.includes(key))
      .forEach(key => (this[key] = props[key]));

    Error.captureStackTrace(this, OAuthError);
  }
}

module.exports = OAuthError
