/*!
 * helper-apidocs <https://github.com/ * Module dependencies/helper-apidocs>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var obj = {};

/**
 * <%= resolve("helper-resolve") %>
 * a<%= apidocs("fixtures/b.js") %>
 *
 * ```js
 * <%%= whatever %>
 * ```
 *
 * a{{apidocs "fixtures/b.js"}}
 * @api public
 */

obj.aaa = function (str, obj) {
  return str;
};
