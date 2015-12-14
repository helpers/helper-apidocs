'use strict';

var apidocs = require('./');

module.exports = function(verb) {
  verb.data({nickname: 'apidocs'});
  verb.helper('apidocs', apidocs({
    delims: ['{%', '%}']
  }));

  verb.helper('wrap', function(name) {
    return '{%= ' + name + '(\'index.js\') %}';
  });

  verb.task('default', function(cb) {
    verb.toStream('docs', function(key, view) {
      return key === '.verb';
    })
      .pipe(verb.renderFile())
      .on('error', cb)
      .pipe(verb.pipeline())
      .on('error', cb)
      .pipe(verb.dest('.'))
      .on('finish', cb)
    });
};
