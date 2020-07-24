/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 *
 * @param v
 * @returns {*}
 */
const identity = (v) => v;

/**
 *
 * @param promise
 * @returns {PromiseLike<never> | Promise<never>}
 */
const reverser = (promise) => promise.then(v => Promise.reject(v), identity);

/**
 *
 * @param promises
 * @returns {Promise<never>}
 */
const oneSuccess = (promises) =>
  Promise.all(promises.map(reverser))
    .then(e => Promise.reject(AggregateError.from(e)), identity,);

/**
 * Alias for Object.prototype.hasOwnProperty
 *
 * @param o
 * @param k
 * @returns {boolean}
 */
const hasOwnProperty = (o, k) => Object.prototype.hasOwnProperty.call(o, k)

/**
 *
 */
class AggregateError extends Array {
  name = 'AggregateError';
  get message() {
    return this.map(e => e.message).join('\n');
  }
}

module.exports = {
  oneSuccess,
  hasOwnProperty,
  AggregateError,
}
