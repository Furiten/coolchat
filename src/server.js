/**
 * Server-side entry point
 */

var _ = require('lodash');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var controller = require('./server/controller')(io);
var passport = require('./server/passport-utils')(controller);
var versions = require('./common/version-config');

// Exec middlewares for express and socket.io
require('./server/express-middlewares')(app, io, passport);

var servedFiles = {
    '/failedToEnter/': 'static/failed.html',
    '/bundle.js': 'bundle.js',
    '/bundle.js.map': 'bundle.js.map' // debug only!
};

_.each(servedFiles, function(value, key) {
    app.get(key, function(req, res) {
        res.sendFile(path.resolve(__dirname + '/../build/' + value));
    });
});

app.get('/static*', function(req, res) {
    res.sendFile(path.resolve(__dirname + '/../build' + req.url));
});

app.get('/auth/vkontakte', passport.authenticate('vkontakte', { failureRedirect: '/failedToEnter/' }));
app.get('/auth/google', passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/plus.login'}));

app.get('/auth/vkontakte/callback',
    passport.authenticate('vkontakte', { failureRedirect: '/failedToEnter/' }),
    function(req, res) {
        res.redirect('/?' + versions.authCookieName + '=' + versions.authCookieHash);
    }
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/failedToEnter/' }),
    function(req, res) {
        res.redirect('/?' + versions.authCookieName + '=' + versions.authCookieHash);
    });

app.get('/', function(req, res) {
    if (req.cookies[versions.authCookieName] != versions.authCookieHash && req.query[versions.authCookieName] != versions.authCookieHash) {
        res.sendFile(path.resolve(__dirname + '/../build/static/select_auth_provider.html'));
    } else {
        res.cookie(versions.authCookieName, versions.authCookieHash);
        res.sendFile(path.resolve(__dirname + '/../build/static/index.html'));
    }
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});

io.on('connection', controller.addSocket);
