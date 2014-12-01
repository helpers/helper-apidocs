/*!
 * helper-apidocs <https://github.com/jonschlinkert/helper-apidocs>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var should = require('should');
var handlebars = require('handlebars');
var _ = require('lodash');
var helper = require('./');

describe('sync', function () {
  it('should generate API docs from the given file:', function () {
    var res = helper.sync("fixtures/a.js");
    (/### \[\.one\]/.test(res)).should.be.true;
  });

  it('should generate API docs from a glob of files:', function () {
    var res = helper.sync("fixtures/*.js");
    (/### \[\.one\]/.test(res)).should.be.true;
    (/### \[\.four\]/.test(res)).should.be.true;
  });

  it('should work as a lodash helper:', function () {
    var res = _.template('<%= apidocs("fixtures/a.js") %>', {}, {imports: {apidocs: helper.sync}});
    (/### \[\.one\]/.test(res)).should.be.true;
  });

  it('should work as a lodash mixin:', function () {
    _.mixin({apidocs: helper.sync});
    var res = _.template('<%= _.apidocs("fixtures/a.js") %>', {});
    (/### \[\.one\]/.test(res)).should.be.true;
  });

  it('should work as a handlebars helper:', function () {
    handlebars.registerHelper('apidocs', helper.sync);
    var res = handlebars.compile('{{apidocs "fixtures/a.js"}}')();
    (/### \[\.one\]/.test(res)).should.be.true;
  });
});

describe('helper apidocs', function () {
  it('should generate API docs from the given file:', function () {
    helper("fixtures/a.js", function (err, content) {
      (/### \[\.one\]/.test(content)).should.be.true;
    });
  });

  it('should generate API docs from a glob of files:', function () {
    helper("fixtures/*.js", function (err, content) {
      (/### \[\.one\]/.test(content)).should.be.true;
      (/### \[\.four\]/.test(content)).should.be.true;
    });
  });
});
