var verb = require('verb');

verb.asyncHelper('apidocs', require('./'));

verb.task('default', function () {
  verb.src('.verb.md')
    .pipe(verb.dest('.'));
});
