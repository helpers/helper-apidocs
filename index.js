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
var loader = require('./load');
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

function apidocs(patterns, options, cb) {
  if (typeof options === 'function') {
    cb = options; options = {};
  }

  var opts = extend({sep: '\n', dest: 'README.md'}, options);
  var dest = opts.dest;
  if (dest && dest.indexOf('://') === -1) {
    dest = relative(dest);
  }

  opts.cwd = opts.cwd ? path.dirname(opts.cwd) : process.cwd();
  var app = this && this.app;
  if (app && app.create) {
    app.create('apidoc', {isRenderable: true, isPartial: true });
  }

  // we can't pass the `opts` object to glob because it bugs out
  glob(patterns, opts, function(err, files) {
    async.mapSeries(files, function(fp, next) {
      var res = tutil.headings(comments(fp, dest, opts));

      if (app) {
        app.option('renameKey', function (fp) {
          return fp;
        });

        app.apidoc({ path: fp, content: res });
        var file = app.views.apidocs[fp];
        app.render(file, opts, next);
      } else {
        next(null, res);
      }
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
    dest = relative(dest);
  }

  opts.cwd = opts.cwd ? path.dirname(opts.cwd) : process.cwd();
  var app = this && this.app;
  if (app && app.create) {
    app.create('apidoc', {isRenderable: true, isPartial: true });
  }

  return glob.sync(patterns, opts).map(function (fp) {
    var res = tutil.headings(comments(fp, dest, opts));
    fp = relative(fp);

    if (app) {
      app.option('renameKey', function (fp) {
        return fp;
      });

      app.apidoc({ path: fp, content: res });
      var file = app.views.apidocs[fp];
      return app.render(file, opts);
    }
    return res;
  }).join('\n');
};