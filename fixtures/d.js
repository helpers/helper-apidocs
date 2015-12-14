/*!
 * helper-apidocs <https://github.com/helper-apidocs>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var obj = {};

/**
 * d<%= apidocs("fixtures/e.js") %>
 * @name  ddd
 * @api public
 */

obj.ddd = function (str, obj) {
  return str;
};
