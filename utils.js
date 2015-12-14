'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('template-bind-helpers', 'bindHelpers');
require('js-comments', 'jscomments');
require('mixin-deep', 'merge');
require('matched', 'glob');
require('relative');
require('is-glob');

/**
 * Restore `require`
 */

require = fn;

/**
 * Expose `utils` modules
 */

module.exports = utils;
