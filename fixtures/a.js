/*!
 * helper-apidocs <https://github.com/ * Module dependencies/helper-apidocs>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var obj = {};

/**
 * Do stuff with the given `str` and `obj`.
 *
 * @param {String} `str`
 * @param {Object} `obj`
 * @return {String}
 * @api public
 */

obj.one = function (str, obj) {
  return str;
};

/**
 * Do stuff with the given `str` and `obj`.
 *
 * @param {String} `str`
 * @param {Object} `obj`
 * @return {String}
 * @api private
 */

obj.two = function (str, obj) {
  return str;
};