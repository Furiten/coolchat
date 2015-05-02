'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var watch = require('gulp-watch');
var watchify = require('watchify');
var del = require('del');
var server = require('gulp-express');

var sourceFile = './src/client/modules/chat.js';
var destFile = 'bundle.js';
var destFolder = './build/';

function handleErrors(msg) {
    console.log(msg);
}

gulp.task('build-js', function() {
    var bundler = browserify({
        entries: [sourceFile]
    });

    var bundle = function() {
        return bundler.bundle()
            .on('error', handleErrors)
            .pipe(source(destFile))
            .pipe(buffer())
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(destFolder));
    };

    return bundle();
});

gulp.task('watch-js', function() {
    var bundler = browserify({
        // Required watchify args
        cache: {}, packageCache: {}, fullPaths: true,
        // Browserify Options
        entries: [sourceFile],
        debug: true
    });

    var bundle = function() {
        return bundler
            .bundle()
            .on('error', handleErrors)
            .pipe(source(destFile))
            .pipe(gulp.dest(destFolder));
    };

    bundler = watchify(bundler);
    bundler.on('update', bundle);

    return bundle();
});

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

gulp.task('default', ['watch-js', 'server', 'watch-static']);
gulp.task('release', ['build-js', 'move-static']);