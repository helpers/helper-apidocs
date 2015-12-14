'use strict';

var apidocs = require('./');

module.exports = function(verb) {
  verb.data({nickname: 'apidocs'});
  verb.asyncHelper('apidocs', apidocs({
    delims: ['{%', '%}']
  }));

  verb.helper('wrap', function(name) {
    return '{%= ' + name + '(\'index.js\') %}';
  });

  verb.task('default', function(cb) {
    verb.toStream('docs', function(key, view) {
      return view.basename === 'readme.md';
    })
      .pipe(verb.renderFile())
      .on('error', cb)
      .pipe(verb.pipeline())
      .on('error', cb)
      .pipe(verb.dest('.'))
      .on('finish', cb)
    });
};
