'use strict';

/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');
var glob = require('matched');
var bindHelpers = require('template-bind-helpers');
var jscomments = require('js-comments');
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
  return function(patterns, options) {
    var appOptions = merge({}, this.options);
    var opts = merge({}, config, appOptions.apidocs, options);

    var currentView = this.context.view || {};
    opts.cwd = opts.cwd || process.cwd();

    var delims = opts.escapeDelims || ['<%%=', '<%='];
    var found = false;
    var views = {};
    var res = '';

    if (typeof patterns === 'string' && !isGlob(patterns)) {
      var collections = this.app.views;
      var view;

      for (var key in collections) {
        var collection = this.app[key];
        view = collection.getView(patterns);
        if (view) {
          break;
        }
      }

      if (view) {
        views[view.key] = view;
        found = true;
      }
    }

    if (!found) {
      views = this.app.load(patterns, options);
    }

    var res = '';
    for (var key in views) {
      var view = views[key];
      res += renderComments(this.app, view, opts);
    }

    var doc = this.app.view('apidoc', {content: res, engine: 'text'});
    var res = doc.compile(opts);
    return res.fn(opts);
  };
};

function renderComments(app, view, opts) {
  opts = bindHelpers(app, view, opts, true);
  opts.examples = app.context.examples || {};

  var parsed = jscomments.parse(view.content, opts);
  var comments = filter(parsed, opts);
  var dest = normalize(view.path, view.dest || opts.dest || 'readme.md');
  opts.path = view.path;
  opts.data = merge({path: dest, file: view}, opts);
  return jscomments.render(comments, opts);
}

function normalize(fp, dest) {
  if (fp.indexOf('//') === -1) {
    return relative(dest, fp);
  }
  return fp;
}

function filter(arr, opts) {
  return arr.filter(function (ele, i) {
    var comment = ele.comment;
    if (/Copyright/.test(comment.content) && i === 0) {
      return false;
    }
    return true;
  });
}
