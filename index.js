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

var fs = require('fs');
var path = require('path');
var glob = require('matched');
var bindHelpers = require('template-bind-helpers');
var comments = require('js-comments');
var relative = require('relative');
var isGlob = require('is-glob');
var merge = require('mixin-deep');
var fileCache = {};

/**
 * Generate API docs from code comments for any JavaScript
 * files that match the given `patterns`. Note that **only code
 * comments with `@api public` will be rendered.**
 *
 * **Example**
 *
 * ```js
 * apidocs("index.js");
 * ```
 *
 * @param  {String} `patterns` Glob patterns for files with code comments to render.
 * @param  {Object} `options` Options to pass to [js-comments].
 * @return {String} Markdown-formatted API documentation
 * @api public
 */

module.exports = function apidocs(config) {
  config = merge({}, config);

  return function(patterns, opts) {
    var options = (this && this.options) || {};
    opts = merge({}, options, options.apidocs, opts);

    opts.file = opts.file || {};
    opts.dest = opts.dest || 'README.md';
    opts.cwd = opts.cwd || process.cwd();

    var delims = opts.escapeDelims || ['<%%=', '<%='];
    var files = cache(patterns, opts);
    var len = files.length, i = 0;
    var res = '', context = {};

    if (this && this.app) {
      opts = bindHelpers(this.app, opts, false);
      opts.examples = this.app.cache.data.examples || {};
      context = this.context;
    }

    while (len--) {
      var fp = files[i++];
      var str = fs.readFileSync(fp, 'utf8');
      var arr = comments.parse(str, opts);
      var checked, n = 0;

      arr = filter(arr, opts, checked, n);

      var ctx = merge({}, opts);
      ctx.file = ctx.file || {};
      ctx.file.path = normalize(ctx.file.path, fp, opts.dest);
      ctx.data = context;

      res += comments.render(arr, ctx);
    }

    res = comments.format(res);
    if (this && this.app) {
      res = res.split(delims[0] || '<%%=').join('__DELIM__');
      res = this.app.render(res, opts);
      res = res.split('__DELIM__').join(delims[1] || '<%=');
    }
    return res;
  };
};

function cache(patterns, options) {
  var opts = merge({cwd: process.cwd()}, options);
  var key = patterns.toString();
  if (fileCache.hasOwnProperty(key)) {
    return fileCache[key];
  }
  var files = isGlob(patterns)
    ? glob.sync(patterns, opts)
    : [patterns];

  files = files.map(function (fp) {
    return path.join(opts.cwd, fp);
  });
  return (fileCache[key] = files);
}

function normalize(fp, fallback, dest) {
  fp = fp || fallback;
  if (fp.indexOf('//') === -1) {
    return relative(dest, fp);
  }
  return fp;
}

function filter(arr, opts, checked, n) {
  return arr.filter(function (ele, i) {
    n = n || 0;
    if (!checked && /Copyright/.test(ele.description) && i === 0) {
      checked = true;
      n++;
    }
    if (opts.skipFirst && i === n) return false;
    return true;
  });
}
