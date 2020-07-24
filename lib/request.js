/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const typeis = require('type-is')
const { InvalidArgumentError } = require('./errors')
const { hasOwnProperty } = require('./utils/fn')

/**
 * Request class
 *
 * @class
 */
class Request {
  /**
   * Create a request instance
   *
   * @param {IncomingMessage} request - The incoming message request
   */
  constructor(request) {
    if (!request.headers) {
      throw new InvalidArgumentError('Missing parameter: `headers`');
    }

    if (!request.method) {
      throw new InvalidArgumentError('Missing parameter: `method`');
    }

    if (typeof request.method !== 'string') {
      throw new InvalidArgumentError('Invalid parameter: `method`');
    }

    if (!request.query) {
      throw new InvalidArgumentError('Missing parameter: `query`');
    }

    this.body = request.body || {};
    this.headers = {};
    this.method = request.method.toUpperCase();
    this.query = request.query;

    // Store the headers in lower case.
    for (const field of Object.keys(request.headers)) {
      if (hasOwnProperty(request.headers, field)) {
        this.headers[field.toLowerCase()] = request.headers[field];
      }
    }

    // Store additional properties of the request object passed in
    for (const property of Object.keys(request)) {
      if (hasOwnProperty(request, property) && !this[property]) {
        this[property] = request[property];
      }
    }
  }

  /**
   * Get a request header.
   *
   * @param {String} field
   * @returns {*}
   */
  get(field) {
    return this.headers[field.toLowerCase()];
  }

  /**
   * Check if the content-type matches any of the given mime type.
   *
   * @param types
   * @returns {boolean}
   */
  is(types) {
    if (!Array.isArray(types)) {
      types = [].slice.call(arguments);
    }
    return typeis(this, types) || false;
  }
}

module.exports = Request
