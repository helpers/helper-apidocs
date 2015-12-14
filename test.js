/*!
 * helper-apidocs <https://github.com/jonschlinkert/helper-apidocs>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('should');
var path = require('path');
var handlebars = require('handlebars');
var Templates = require('templates');
var _ = require('lodash');
var helper = require('./')();
var app;

function resolve(fp, next) {
  next(null, resolveSync(fp));
}

function render(str, data) {
  return _.template(str)(data);
}

function resolveSync(fp) {
  var pkg = path.resolve('node_modules', fp, 'package.json');
  var obj = require(pkg);
  var main = obj && obj.main;
  return path.resolve(path.dirname(pkg), main);
}

var helpers = {resolve: resolveSync};

// describe('sync', function() {
//   it('should generate API docs from the given file:', function() {
//     var res = helper("fixtures/a.js", render);
//     res.should.match(/### \[\.aaa\]/);
//   });

//   it('should allow a dest path for relative links to be defined on the opts:', function() {
//     var res = helper("fixtures/a.js", {dest: 'foo/bar/README.md'}, render);
//     // res.should.match(/\.\.\/\.\.\/fixtures\/a\.js/);
//   });

//   it('should generate API docs from a glob of files:', function() {
//     var res = helper("fixtures/*.js");
//     res.should.match(/### \[\.aaa\]/);
//     res.should.match(/### \[\.bbb\]/);
//   });

//   it.skip('should work as a lodash helper:', function() {
//     var res = _.template('<%= apidocs("fixtures/c.js") %>', {imports: {apidocs: helper}});
//     res.should.match(/### \[\.ccc\]/);
//   });

//   it('should work as a lodash mixin:', function() {
//     _.mixin({apidocs: helper});
//     var res = _.template('<%= _.apidocs("fixtures/a.js") %>')({});
//     res.should.match(/### \[\.aaa\]/);
//   });

//   it('should work as a handlebars helper:', function() {
//     handlebars.registerHelper('apidocs', function(name) {
//       return new handlebars.SafeString(helper(name));
//     });
//     var res = handlebars.compile('{{apidocs "fixtures/a.js"}}')();
//     res.should.match(/### \[\.aaa\]/);
//   });
// });

describe('sync:template', function() {
  beforeEach(function(cb) {
    app = new Templates();
    app.engine('text', require('engine-base'));
    app.create('pages', {engine: 'text'});
    app.helper('apidocs', helper);
    app.helper('resolve', resolveSync);
    cb();
  });

  it('should work with Templates:', function(cb) {
    app.page('docs', {content: '<%= apidocs("fixtures/a.js") %>'})
      .render(function(err, res) {
        if (err) return cb(err);
        // res.content.should.match(/### \[\.aaa\]/);
        cb();
      });
  });

  it('should resolve nested templates:', function(cb) {
    app.page('docs', {content: '<%= apidocs("fixtures/a.js") %>'})
      .render(function(err, res) {
        if (err) return cb(err);
        console.log(res.content)
        // res.content.should.match(/node_modules/i);
        cb();
      });
  });

  it('should replace escaped templates with non-characters:', function(cb) {
    app.page('docs', {content: '<%= apidocs("fixtures/a.js") %>'})
      .render(function(err, res) {
        if (err) return cb(err);
        res.content.should.match(/<%=\s*whatever\s*%>/i);
        cb();
      });
  });

  // it('should generate API docs from the given file:', function(cb) {
  //   helper("fixtures/a.js", function(err, content) {
  //     content.should.match(/### \[\.aaa\]/);
  //     cb()
  //   });
  // });

  // it('should generate API docs from a glob of files:', function(cb) {
  //   helper("fixtures/*.js", function(err, content) {
  //     content.should.match(/### \[\.aaa\]/);
  //     content.should.match(/### \[\.ddd\]/);
  //     cb();
  //   });
  // });
});
