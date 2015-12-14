/*!
 * helper-apidocs <https://github.com/helper-apidocs>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var obj = {};

/**
 * b<%= apidocs("fixtures/c.js") %>
 *
 * @param {String} `str`
 * @param {Object} `obj`
 * @return {String}
 * @api public
 */

obj.bbb = function (str, obj) {
  return str;
};
