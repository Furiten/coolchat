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

require('./server/express-middlewares')(app, io, passport); // Exec middlewares for express and socket.io
require('./server/routes/auth')(app, passport);
require('./server/routes/static')(app);

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
