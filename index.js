/*!
 * helper-apidocs <https://github.com/jonschlinkert/helper-apidocs>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/**
 * Module dependencies
 */

var path = require('path');
var glob = require('globby');
var async = require('async');
var extend = require('extend-shallow');
var tutil = require('template-utils');

/**
 * Requires cache
 */

var requires = {};
var jscomments = requires.jscomments || (requires.jscomments = require('js-comments'));

/**
 * Expose `apidocs` helper
 */

module.exports = apidocs;

/**
 * `apidocs` helper.
 */

function apidocs(patterns, options, cb) {
  if (typeof options === 'function') {
    cb = options; options = {};
  }

  var opts = extend({sep: '\n', dest: 'README.md'}, options);
  var dest = opts.dest;
  if (dest && dest.indexOf('://') === -1) {
    dest = path.relative(process.cwd(), dest);
  }

  opts.cwd = opts.cwd ? path.dirname(opts.cwd) : process.cwd();

  // we can't pass the `opts` object to glob because it bugs out
  glob(patterns, opts, function(err, files) {
    async.mapSeries(files, function(fp, next) {
      return next(null, tutil.headings(jscomments(fp, dest, opts)));
    }, function (err, arr) {
      if (err) return cb(err);
      cb(null, arr.join('\n'));
    });
  });
}

apidocs.sync = function(patterns, options) {
  var opts = extend({sep: '\n', dest: 'README.md'}, options);
  var dest = opts.dest;
  if (dest && dest.indexOf('://') === -1) {
    dest = path.relative(process.cwd(), dest);
  }

  opts.cwd = opts.cwd ? path.dirname(opts.cwd) : process.cwd();

  return glob.sync(patterns, opts).map(function (fp) {
    return tutil.headings(jscomments(fp, dest, opts));
  }).join('\n');
};