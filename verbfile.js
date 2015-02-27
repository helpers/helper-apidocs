var verb = require('verb');

// this helper is already included in verb,
// it's only used here for tests
verb.asyncHelper('apidocs', require('./'));

verb.task('default', function () {
  verb.src('.verb.md')
    .pipe(verb.dest('.'));
});
