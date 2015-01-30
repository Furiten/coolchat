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

// Passport-vkontakte authentication entry point
app.get('/auth/vkontakte',
    passport.authenticate('vkontakte', { failureRedirect: '/failedToEnter/' }),
    function(req, res){
        // The request will be redirected to vk.com for authentication, so
        // this function will not be called.
    }
);

// Passport-vkontakte callback
app.get('/auth/vkontakte/callback',
    passport.authenticate('vkontakte', { failureRedirect: '/failedToEnter/' }),
    function(req, res) {
        res.redirect('/?' + versions.authCookieName + '=' + versions.authCookieHash);
    }
);

app.get('/', function(req, res) {
    if (req.cookies[versions.authCookieName] != versions.authCookieHash && req.query[versions.authCookieName] != versions.authCookieHash) {
        res.redirect('/auth/vkontakte');
    } else {
        res.cookie(versions.authCookieName, versions.authCookieHash);
        res.sendFile(path.resolve(__dirname + '/../build/static/index.html'));
    }
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});

io.on('connection', controller.addSocket);
