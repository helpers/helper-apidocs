'use strict';

var apidocs = require('./');

module.exports = function(verb) {
  verb.asyncHelper('apidocs', apidocs());

  verb.task('default', function() {
    verb.src('.verb.md')
      .pipe(verb.dest('.'));
  });
};
