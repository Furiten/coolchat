'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var watch = require('gulp-watch');
var watchify = require('watchify');
var del = require('del');
var server = require('gulp-express');

var bundler = watchify(browserify('./src/client.js', watchify.args));
function bundle() {
    return bundler.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
//        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./build/'));
}

gulp.task('build-js', bundle);
bundler.on('update', bundle);

gulp.task('watch-static', ['move-static'], function() {
    watch('./src/client/static/**/*', {base: './src/client/static/'})
        .pipe(gulp.dest('./build/static/'));
});

gulp.task('move-static', function() {
    return gulp.src('./src/client/static/**/*', {base: './src/client/static/'})
        .pipe(gulp.dest('./build/static/'));
});

gulp.task('server', function () {
    server.run({ file: './src/server.js' });
    gulp.watch([
        'src/server.js',
        'src/server/*.js',
        'src/server/**/*.js',
        'src/common/*.js',
        'src/common/**/*.js'
    ], [server.run]);
});

gulp.task('clean', function(cb) {
    del([
        'build/**'
    ]);
});

gulp.task('default', ['build-js', 'server', 'watch-static']);