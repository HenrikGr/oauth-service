/**
 * @prettier
 * @copyright (c) 2020 - present, HGC-AB
 * @licence This source code is licensed under the MIT license described and found in the
 * LICENSE file in the root directory of this source tree.
 */


/**
 * Validation rules.
 */
const Rules = {
  NCHAR: /^[\u002D|\u002E|\u005F|\w]+$/,
  NQCHAR: /^[\u0021|\u0023-\u005B|\u005D-\u007E]+$/,
  NQSCHAR: /^[\u0020-\u0021|\u0023-\u005B|\u005D-\u007E]+$/,
  UNICODECHARNOCRLF: /^[\u0009|\u0020-\u007E|\u0080-\uD7FF|\uE000-\uFFFD|\u10000-\u10FFFF]+$/,
  URI: /^[a-zA-Z][a-zA-Z0-9+.-]+:/,
  VSCHAR: /^[\u0020-\u007E]+$/,
}

/**
 * Validate if a value matches a unicode character.
 *
 * @param value
 * @returns {boolean}
 * @see https://tools.ietf.org/html/rfc6749#appendix-A
 */
const nchar = (value) => Rules.NCHAR.test(value);

/**
 * Validate if a value matches a unicode character, including exclamation marks.
 *
 * @param value
 * @returns {boolean}
 * @see https://tools.ietf.org/html/rfc6749#appendix-A
 */
const nqchar = (value) => Rules.NQCHAR.test(value);

/**
 * Validate if a value matches a unicode character, including exclamation marks and spaces.
 *
 * @param value
 * @returns {boolean}
 * @see https://tools.ietf.org/html/rfc6749#appendix-A
 */
const nqschar = (value) => Rules.NQSCHAR.test(value);

/**
 * Validate if a value matches a unicode character excluding
 * the carriage and linefeed characters.
 *
 * @param value
 * @returns {boolean}
 * @see https://tools.ietf.org/html/rfc6749#appendix-A
 */
const uchar = (value) => Rules.UNICODECHARNOCRLF.test(value);

/**
 * Validate if a value matches generic URIs.
 *
 * @param value
 * @returns {boolean}
 * @see http://tools.ietf.org/html/rfc3986#section-3
 */
const uri = (value) => Rules.URI.test(value);

/**
 * Validate if a value matches against the printable set of unicode characters.
 *
 * @param value
 * @returns {boolean}
 * @see https://tools.ietf.org/html/rfc6749#appendix-A
 */
const vschar = (value) => Rules.VSCHAR.test(value);

module.exports = {
  nchar,
  nqchar,
  nqschar,
  uchar,
  vschar,
  uri,
}
