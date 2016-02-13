'use strict';

var apidocs = require('./');

module.exports = function(verb) {
  verb.extendWith('verb-readme-generator');

  verb.helper('apidocs', apidocs({
    delims: ['{%', '%}']
  }));

  verb.helper('wrap', function(name) {
    return '{%= ' + name + '(\'index.js\') %}';
  });

  verb.task('default', ['readme']);
};
