'use strict';

var gulp = require('gulp');
var karma = require('karma').server;
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var clean = require('gulp-clean');
var mocha = require('gulp-mocha');

gulp.task('clean', function() {
	gulp.src('results', {read: false})
		.pipe(clean());
});

gulp.task('lint', function() {
  gulp.src(['server/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// Combined task test to test client then server (via callback)
gulp.task('test', function (cb) {
  return gulp.src(['server/**/*.spec.js'], { read: false })
    .pipe(mocha({
      reporter: 'spec',
      globals: {
      }
    }));
});

gulp.task('watch', function() {
	gulp.watch(['server/**/*.js'], ['clean', 'lint', 'test']);
});

gulp.task('default', ['clean', 'lint', 'test']);
