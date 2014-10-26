var browserify = require('browserify');
var buffer     = require('vinyl-buffer');
var cp         = require('cp');
var gulp       = require('gulp');
var livereload = require('tiny-lr');
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

var port = 9292;
var livereloadPort = 9293;

gulp.task('express', function() {
  var express = require('express');
  var app = express();
  app.use(require('connect-livereload')({ port: livereloadPort }));
  app.use(express.static(__dirname + '/public'));
  app.listen(port);
});

gulp.task('scripts', function() {
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

var tinylr;
gulp.task('livereload', function() {
  tinylr = livereload();
  tinylr.listen(livereloadPort);
});

function notifyLiveReload(event) {
  var fileName = require('path').relative(__dirname, event.path);
  tinylr.changed({
    body: {
      files: [fileName]
    }
  });
}

gulp.task('watch', function() {
  gulp.watch('public/*.html', notifyLiveReload);
  gulp.watch('public/js/app.js', notifyLiveReload);
});

gulp.task('default', ['express', 'scripts', 'livereload', 'watch']);
