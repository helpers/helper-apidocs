'use strict';

/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');
var utils = require('./utils');

/**
 * Generate API docs from code comments for any JavaScript
 * files that match the given `patterns`. Note that **only code
 * comments with `@api public` will be rendered.**
 *
 * ```js
 * apidocs("index.js");
 * ```
 * @param  {String} `patterns` Glob patterns for files with code comments to render.
 * @param  {Object} `options` Options to pass to [js-comments][].
 * @return {String} Markdown-formatted API documentation
 * @api public
 */

module.exports = function apidocs(config) {
  return function(patterns, options) {
    if (!this || !this.options) {
      return fallback.apply(null, arguments);
    }

    var appOptions = utils.merge({}, this.options);
    var opts = utils.merge({}, config, appOptions.apidocs, options);
    opts.escapeDelims = opts.escapeDelims || ['<%%=', '<%='];
    opts.delims = opts.delims || ['<%=', '%>'];

    opts.cwd = opts.cwd || process.cwd();
    var found = false;
    var views = {};

    if (typeof patterns === 'string' && !utils.isGlob(patterns)) {
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

    if (!found && typeof this.app.load === 'function') {
      views = this.app.load(patterns, options);
    } else if (!found) {
      collection = this.app.collection();
      var files = utils.glob.sync(patterns, opts);

      files.forEach(function(filename) {
        var fp =  path.resolve(opts.cwd, filename);
        collection.addView(fp, {
          content: fs.readFileSync(fp),
          path: fp
        });
      });

      if (files.length) {
        views = collection;
      }
    }

    var content = '';
    for (var name in views) {
      view = views[name];
      escape(view, opts.escapeDelims[0]);
      var rendered = renderComments(this.app, view, opts);
      content += rendered;
    }

    var doc = this.app.view('apidoc', {content: content, engine: 'text'});
    var result = doc.compile(opts);
    var out = unescape(result.fn(opts), opts.escapeDelims[1]);
    return out;
  };
};

function fallback(patterns, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }

  var opts = utils.merge({cwd: process.cwd(), dest: 'readme.md'}, options);
  opts.delims = opts.delims || ['<%=', '%>'];
  opts.escapeDelims = opts.escapeDelims || ['<%%=', '<%='];
  var files = utils.glob.sync(patterns, opts);
  var res = '';

  files.forEach(function(filename) {
    var fp = path.join(opts.cwd, filename);
    var str = fs.readFileSync(fp, 'utf8');
    str = str.split(opts.escapeDelims[0]).join('__ESC_DELIM__');

    var file = {
      cwd: opts.cwd,
      name: path.basename(fp, path.extname(fp)),
      base: path.dirname(fp),
      path: fp,
      content: str
    };

    var parsed = utils.jscomments.parse(str, opts);
    var comments = filter(parsed, opts);
    opts.path = file.path;
    var dest = normalize(file.path, opts.dest);

    opts.data = utils.merge({path: dest, file: file}, opts);
    opts.data.apidocs = fallback;
    if (!opts.data.resolve) {
      opts.data.resolve = resolveSync;
    }

    var result = utils.jscomments.render(comments, opts);
    if (result && typeof fn === 'function') {
      while (result.indexOf(opts.delims[0]) !== -1) {
        var before = result;
        result = fn(result, opts.data);
        if (result === before) {
          break;
        }
      }
    }

    result = result.split('__ESC_DELIM__').join(opts.escapeDelims[1]);
    res += result;
  });

  res = res.replace(/\n{2,}/g, '\n\n');
  return res;
}

function renderComments(app, view, opts) {
  opts = utils.bindHelpers(app, view, opts, true);
  var data = app.cache.data;
  var examples = data.examples || {};
  opts.examples = utils.merge({}, app.context.examples, examples);

  var parsed = utils.jscomments.parse(view.content, opts);
  var comments = filter(parsed, opts);
  var dest = normalize(view.path, view.dest || opts.dest || 'readme.md');
  opts.path = view.path;
  opts.data = utils.merge({path: dest, file: view}, opts);
  return utils.jscomments.render(comments, opts);
}

function resolveSync(fp) {
  var pkg = path.resolve('node_modules', fp, 'package.json');
  try {
    var obj = require(pkg);
    var main = obj && obj.main;
    return path.resolve(path.dirname(pkg), main);
  } catch (err) {
    throw err;
  }
}

function escape(file, escapeDelims) {
  file.content = file.content.split(escapeDelims).join('__ESC_DELIM__');
}

function unescape(str, unescapeDelim) {
  return str.split('__ESC_DELIM__').join(unescapeDelim);
}

function normalize(fp, dest) {
  if (fp.indexOf('//') === -1) {
    return utils.relative(dest, fp);
  }
  return fp;
}

function filter(arr, opts) {
  return arr.filter(function(ele, i) {
    var comment = ele.comment;
    if (/Copyright/.test(comment.content) && i === 0) {
      return false;
    }
    return true;
  });
}
