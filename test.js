/*!
 * helper-apidocs <https://github.com/jonschlinkert/helper-apidocs>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('should');
var handlebars = require('handlebars');
var Template = require('template');
var _ = require('lodash');
var helper = require('./');

describe('sync', function () {
  it('should generate API docs from the given file:', function () {
    var res = helper.sync("fixtures/a.js");
    res.should.match(/### \[\.one\]/);
  });

  it('should allow a dest path for relative links to be define on the opts:', function () {
    var res = helper.sync("fixtures/a.js", {dest: 'foo/bar/README.md'});
    res.should.match(/\.\.\/\.\.\/fixtures\/a\.js/);
  });

  it('should generate API docs from a glob of files:', function () {
    var res = helper.sync("fixtures/*.js");
    res.should.match(/### \[\.one\]/);
    res.should.match(/### \[\.four\]/);
  });

  it('should work as a lodash helper:', function () {
    var res = _.template('<%= apidocs("fixtures/a.js") %>', {imports: {apidocs: helper.sync}})({});
    res.should.match(/### \[\.one\]/);
  });

  it('should work as a lodash mixin:', function () {
    _.mixin({apidocs: helper.sync});
    var res = _.template('<%= _.apidocs("fixtures/a.js") %>')({});
    res.should.match(/### \[\.one\]/);
  });

  it('should work as a handlebars helper:', function () {
    handlebars.registerHelper('apidocs', helper.sync);
    var res = handlebars.compile('{{apidocs "fixtures/a.js"}}')();
    res.should.match(/### \[\.one\]/);
  });

  it('should work with Template:', function () {
    var template = new Template();
    template.helper('apidocs', helper.sync);
    template.page('docs', {content: '<%= apidocs("fixtures/a.js") %>'});
    template.render('docs').should.match(/### \[\.one\]/);
  });
});

describe('helper apidocs', function () {
  it('should work with Template:', function (done) {
    var template = new Template();
    template.asyncHelper('apidocs', helper);
    template.page('docs', {content: '<%= apidocs("fixtures/a.js") %>'});

    template.render('docs', function (err, content) {
      if (err) return done(err);
      content.should.match(/### \[\.one\]/);
      done();
    });
  });

  it('should generate API docs from the given file:', function () {
    helper("fixtures/a.js", function (err, content) {
      content.should.match(/### \[\.one\]/);
    });
  });

  it('should generate API docs from a glob of files:', function () {
    helper("fixtures/*.js", function (err, content) {
      content.should.match(/### \[\.one\]/);
      content.should.match(/### \[\.four\]/);
    });
  });
});
