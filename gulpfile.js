var gulp  = require('gulp');
var concat = require('gulp-concat');


/**
 * Tasks
 * ======================================================================== */

var getScriptNames = function() {
  var component = require('./component.json');

  return component.scripts.filter(function(element) {
    return /\.sjs$/.test(element);
  });
};


gulp.task('concat', function() {
  gulp.src(getScriptNames())
    .pipe(concat('index.sjs'))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
  gulp.watch(getScriptNames(), ['concat']);
});

gulp.task('dist', ['concat']);
gulp.task('build', ['concat']);

gulp.task('default', []);