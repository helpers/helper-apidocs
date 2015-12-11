'use strict';

module.exports = function(verb) {
  verb.data({nickname: 'apidocs'});

  // this helper is already included in verb,
  // it's only used here for tests
  verb.asyncHelper('apidocs', require('./'));
  verb.helper('wrap', function(name) {
    return '{%= ' + name + '(\'index.js\') %}';
  });

  verb.task('default', function () {
    console.log(verb)
    return verb.src('.verb.md')
      .pipe(verb.renderFile('text'))
      .pipe(verb.dest('.'))
  });
};
