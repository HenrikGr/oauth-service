/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

const { hasOwnProperty } = require('./utils/fn')

/**
 * Response class
 *
 * @class
 */
class Response {
  /**
   * Create a response instance
   *
   * @param {ServerResponse} response - The http server response object
   */
  constructor(response) {
    this.body = response.body || {}
    this.headers = {}
    this.status = 200

    // Store the headers in lower case.
    for (const field of Object.keys(response.headers || {})) {
      if (hasOwnProperty(response.headers, field)) {
        this.headers[field.toLowerCase()] = response.headers[field];
      }
    }

    // Store additional properties of the response object passed in.
    for (const property of Object.keys(response)) {
      if (hasOwnProperty(response, property) && !this[property]) {
        this[property] = response[property];
      }
    }
  }

  /**
   * Get a response header.
   *
   * @param field
   * @returns {*}
   */
  get(field) {
    return this.headers[field.toLowerCase()];
  }

  /**
   * Set a response header.
   *
   * @param field
   * @param value
   */
  set(field, value) {
    this.headers[field.toLowerCase()] = value;
  }

  /**
   * Redirect response.
   *
   * @param url
   */
  redirect(url) {
    this.set('Location', url)
    this.status = 302
  }

}

module.exports = Response
