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
var verb = require('verb');
var Template = require('template');
var template = new Template();

/**
 * Requires cache
 */

var requires = {};
var comments = requires.comments || (requires.comments = require('js-comments'));

template.option('renameKey', false);
template.asyncHelper('resolve', require('helper-resolve'));
template.asyncHelper('apidocs', function (name, cb) {
  var tmpl = template.getApidoc(name);
  template.render(tmpl, function (err, content) {
    if (err) console.log(err);

  console.log(content)
    cb(null, name);
  });
});

template.create('apidoc', {isRenderable: true, isPartial: true}, [
  function (patterns) {
    return glob.sync(patterns);
  },
  function (files) {
    return files.reduce(function (acc, fp) {
      var name = path.basename(fp, path.extname(fp));
      var res = comments(fp);
      res = tutil.headings(res);

      acc[name] = {path: fp, content: res, layout: null};
      return acc;
    }, {});
  }
]);


template.apidocs('fixtures/*.js');


Object.keys(template.views.apidocs).forEach(function (key) {
  var tmpl = template.getApidoc(key);
  console.log(tmpl)
  // template.render(tmpl, function (err, content) {
  //   if (err) console.log(err);

  // });
});