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
var Template = require('template');
var lookup = require('look-up');
var _ = require('lodash');
var helper = require('./');
var template;

function resolve(fp, next) {
  next(null, resolveSync(fp));
}

function resolveSync(fp, next) {
  var pkg = lookup('package.json', {cwd: 'node_modules/' + fp});
  var obj = require(pkg);
  var main = obj && obj.main;
  return path.resolve(path.dirname(pkg), main);
}

describe('sync', function () {
  it('should generate API docs from the given file:', function () {
    var res = helper.sync("fixtures/a.js");
    res.should.match(/### \[\.aaa\]/);
  });

  it('should allow a dest path for relative links to be define on the opts:', function () {
    var res = helper.sync("fixtures/a.js", {dest: 'foo/bar/README.md'});
    res.should.match(/\.\.\/\.\.\/fixtures\/a\.js/);
  });

  it('should generate API docs from a glob of files:', function () {
    var res = helper.sync("fixtures/*.js");
    res.should.match(/### \[\.aaa\]/);
    res.should.match(/### \[\.bbb\]/);
  });

  it('should work as a lodash helper:', function () {
    var res = _.template('<%= apidocs("fixtures/c.js") %>', {imports: {apidocs: helper.sync}})({});
    res.should.match(/### \[\.ccc\]/);
  });

  it('should work as a lodash mixin:', function () {
    _.mixin({apidocs: helper.sync});
    var res = _.template('<%= _.apidocs("fixtures/a.js") %>')({});
    res.should.match(/### \[\.aaa\]/);
  });

  it('should work as a handlebars helper:', function () {
    handlebars.registerHelper('apidocs', function (name) {
      return new handlebars.SafeString(helper.sync(name));
    });
    var res = handlebars.compile('{{apidocs "fixtures/a.js"}}')();
    res.should.match(/### \[\.aaa\]/);
  });
});

describe('sync:template', function () {
  beforeEach(function () {
    template = new Template();
    template.helper('apidocs', helper.sync);
    template.helper('resolve', resolveSync);
  });

  it('should work with Template:', function () {
    template.page('docs', {content: '<%= apidocs("fixtures/a.js") %>'});
    template.render('docs').should.match(/### \[\.aaa\]/);
  });
});

describe('helper apidocs', function () {
  beforeEach(function (cb) {
    template = new Template();
    template.asyncHelper('apidocs', helper);
    template.asyncHelper('resolve', resolve);
    cb();
  });

  it('should work with Template:', function (done) {
    template.page('docs', {content: '<%= apidocs("fixtures/a.js") %>'});
    var tmpl = template.getPage('docs');

    template.render(tmpl, function (err, content) {
      if (err) return done(err);
      content.should.match(/### \[\.aaa\]/);
      done();
    });
  });

  it('should resolve nested templates:', function (done) {
    template.page('docs', {content: '<%= apidocs("fixtures/a.js") %>'});
    var tmpl = template.getPage('docs');

    template.render(tmpl, function (err, content) {
      if (err) return done(err);
      content.should.match(/node_modules/i);
      done();
    });
  });

  it('should generate API docs from the given file:', function (done) {
    helper("fixtures/a.js", function (err, content) {
      content.should.match(/### \[\.aaa\]/);
      done()
    });
  });

  it('should generate API docs from a glob of files:', function (done) {
    helper("fixtures/*.js", function (err, content) {
      content.should.match(/### \[\.aaa\]/);
      content.should.match(/### \[\.ddd\]/);
      done();
    });
  });
});
