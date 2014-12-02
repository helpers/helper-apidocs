/*!
 * helper-apidocs <https://github.com/ * Module dependencies/helper-apidocs>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
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

/**
 * Expose `apidocs` helper
 */

module.exports = apidocs;

/**
 * `apidocs` helper.
 */

function apidocs(patterns, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var opts = extend({sep: '\n', dest: 'README.md'}, options);
  var appOpts = this && this.app && this.app.options;
  var ctx = extend({}, opts, appOpts, this && this.context);
  var dest = ctx.dest ? path.resolve(ctx.dest) : '.';

  opts.cwd = ctx.filepath
    ? path.dirname(ctx.filepath)
    : process.cwd();

  // we can't pass the `ctx` object to glob because it bugs out
  glob(patterns, opts, function(err, files) {
    async.mapSeries(files, function(fp, next) {
      var jscomments = requires.jscomments || (requires.jscomments = require('js-comments'));
      var res = jscomments(fp, dest, opts);
      next(null, tutil.headings(res));
    }, function (err, arr) {
      if (err) return cb(err);
      cb(null, arr.join('\n'));
    });
  });
}

apidocs.sync = function(patterns, options) {
  var appOpts = this && this.app && this.app.options;
  var opts = extend({sep: '\n', dest: 'README.md'}, appOpts, options);
  var ctx = extend({}, this && this.context);
  var dest = path.resolve(ctx.dest || opts.dest);

  opts.cwd = ctx.filepath
    ? path.dirname(ctx.filepath)
    : process.cwd();

  return glob.sync(patterns, opts).map(function (fp) {
    var jscomments = requires.jscomments || (requires.jscomments = require('js-comments'));
    return tutil.headings(jscomments(fp, dest, opts));
  }).join('\n');
};