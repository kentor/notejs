var browserify = require('browserify');
var buffer     = require('vinyl-buffer');
var cp         = require('cp');
var gulp       = require('gulp');
var source     = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify     = require('gulp-uglify');
var watchify   = require('watchify');

gulp.task('build', function() {
  cp.sync('bower_components/ember/ember.prod.js', 'bower_components/ember/ember-browserify.js');

  return browserify('./public/js/main.js')
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('watch', function() {
  cp.sync('bower_components/ember/ember.js', 'bower_components/ember/ember-browserify.js');

  watchify.args.debug = true;
  var bundler = watchify(browserify('./public/js/main.js', watchify.args));

  bundler.on('update', rebundle);
  bundler.on('log', console.error);

  function rebundle() {
    return bundler
      .bundle()
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./public/js/'));
  }

  return rebundle();
});

gulp.task('default', ['watch']);
