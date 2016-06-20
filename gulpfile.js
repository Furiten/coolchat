'use strict';

var webpack = require("webpack");
var gulp = require('gulp');
var path = require('path');
var source = require('vinyl-source-stream');
var watch = require('gulp-watch');
var gutil = require('gulp-util');
var del = require('del');
var server = require('gulp-express');

var webpackDevConfig = {
    entry: './client/modules/chat.js',
    context: __dirname + '/src',

    output: {
        path: __dirname + '/build',
        filename: 'bundle.js'
    },

    devtool: "#inline-source-map",
    watch: true,

    plugins: [
        new webpack.optimize.DedupePlugin()
    ],

    module: {
        loaders: [
            {
                test: /\.hbs/,
                loader: 'handlebars-loader'
            },
            {
                test: /\.(eot|woff|ttf|svg|png|jpg)$/,
                loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]'
            }
        ]
    }
};

var webpackReleaseConfig = {
    entry: './client/modules/chat.js',
    context: __dirname + '/src',

    output: {
        path: __dirname + '/build',
        filename: 'bundle.js'
    },

    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ],

    module: {
        loaders: [
            {
                test: /\.hbs/,
                loader: 'handlebars-loader'
            },
            {
                test: /\.(eot|woff|ttf|svg|png|jpg)$/,
                loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]'
            }
        ]
    }
};

gulp.task('dev', ['server'], function(callback) {
    // run webpack
    webpack(webpackDevConfig, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
    });
});

gulp.task('release', ['move-static'], function(callback) {
    // run webpack
    webpack(webpackReleaseConfig, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        callback();
    });
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

gulp.task('default', ['dev', 'watch-static']);
