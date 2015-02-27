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
var relative = require('relative');
var extend = require('extend-shallow');
var tutil = require('template-utils');

/**
 * Requires cache
 */

var requires = {};
var comments = requires.comments || (requires.comments = require('js-comments'));

/**
 * Expose `apidocs` helper
 */

module.exports = apidocs;

/**
 * `apidocs` helper.
 */
/**
 * Generate API docs from code comments in the JavaScript
 * files that match the given `patterns`. Only code comments
 * with `@api public` are rendered.
 *
 * @param  {String} `patterns`
 * @param  {Object} `options`
 * @return {String}
 * @api public
 */

function apidocs(patterns, options, cb) {
  // if an object is passed, use the `cwd`
  if (typeof patterns === 'object' && !Array.isArray(patterns)) {
    cb = options;
    options = patterns;
    patterns = (options && options.cwd) || '*.js';
  }

  if (typeof options === 'function') {
    cb = options; options = {};
  }

  var opts = extend({sep: '\n', dest: 'README.md'}, options);
  var dest = opts.dest, delims;

  if (dest && dest.indexOf('://') === -1) {
    dest = relative(dest);
  }

  opts.cwd = opts.cwd ? path.dirname(opts.cwd) : process.cwd();
  var app = this && this.app;
  if (app && app.create) {
    app.create('apidoc', {isRenderable: true, isPartial: true });
    delims = opts.delims || app.delims['.*'].original || ['<%', '%>'];
  }

  // we can't pass the `opts` object to glob because it bugs out
  glob(patterns, opts, function(err, files) {
    async.mapSeries(files, function(fp, next) {
      var res = tutil.headings(comments(fp, dest, opts));
      // escaped template variables
      res = tutil.escapeFn(app, delims)(res);

      if (!app) return next(null, tutil.unescapeFn(app)(res));

      app.option('renameKey', function (fp) {
        return fp;
      });


      app.apidoc({ path: fp, content: res, ext: '.md', engine: '.md' });
      var file = app.views.apidocs[fp];

      app.render(file, opts, function (err, content) {
        if (err) return next(err);
        next(null, tutil.unescapeFn(app)(content));
      });
    }, function (err, arr) {
      if (err) return cb(err);
      cb(null, arr.join('\n'));
    });
  });
}

apidocs.sync = function(patterns, options) {
  var opts = extend({sep: '\n', dest: 'README.md'}, options);
  var dest = opts.dest, delims;

  if (dest && dest.indexOf('://') === -1) {
    dest = relative(dest);
  }

  opts.cwd = opts.cwd ? path.dirname(opts.cwd) : process.cwd();
  var app = this && this.app;
  if (app && app.create) {
    app.create('apidoc', {isRenderable: true, isPartial: true });
    delims = opts.delims || app.delims['.*'].original || ['<%', '%>'];
  }

  return glob.sync(patterns, opts).map(function (fp) {
    var res = tutil.headings(comments(fp, dest, opts));
    res = tutil.escapeFn(app, delims)(res);

    if (!app) { return tutil.unescapeFn(app)(res); }

    fp = relative(fp);
    app.option('renameKey', function (fp) {
      return fp;
    });

    app.apidoc({ path: fp, content: res });
    var file = app.views.apidocs[fp];
    return tutil.unescapeFn(app)(app.render(file, opts));
  }).join('\n');
};
