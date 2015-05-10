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
var authController = require('./server/authController');
var passport = require('./server/passport-utils')(controller);
var versions = require('./common/version-config');

require('./server/express-middlewares')(app, io, passport); // Exec middlewares for express and socket.io
require('./server/routes/auth')(app, passport);
require('./server/routes/static')(app);

function setAuthCookie(res, cookie, del) {
    res.cookie(versions.authCookieName, cookie, {
        // todo: не ставится с доменом. разобраться
        //domain: versions.cookieDomain,
        expires: del ? new Date(Date.now() - 1000*60*60*24*7) : new Date(Date.now() + 1000*60*60*24*7)
    });
}

app.get('/', function(req, res) {
    authController.authorizeUser(req.cookies[versions.authCookieName] || req.query[versions.authCookieName], function(err, status, cookie) {
        if (err) {
            res.sendFile(path.resolve(__dirname + '/../build/static/select_auth_provider.html'));
            return;
        }

        setAuthCookie(res, cookie);
        // todo: update user expiration in redis here
        res.sendFile(path.resolve(__dirname + '/../build/static/index.html'));
    });
});

app.get('/logout', function(req, res) {
    authController.logoutUser(req.cookies[versions.authCookieName]);
    setAuthCookie(res, '', true);
    res.redirect('/');
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});

io.on('connection', controller.addSocket);
