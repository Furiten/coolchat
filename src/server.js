/**
 * Server-side entry point
 */

var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('/var/log/ftalk.log'), 'varlog');
var logger = log4js.getLogger('varlog');

var _ = require('lodash');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var EventBus = require('./common/eventBus');

// Instantiate all the components
var main = require('./server/components/main')(io, logger);
var passport = require('./server/components/passport')(); // Special component: returns passport.js instance
var auth = require('./server/components/auth');
var tournaments = require('./server/components/tournaments');

require('./server/middlewares')(app, io, passport); // Exec middlewares for express and socket.io
require('./server/routes/auth')(app, passport);
require('./server/routes/static')(app);
require('./server/routes/common')(app);

http.listen(3000, function() {
    console.log('listening on *:3000');
});

io.on('connection', function(socket) {
    EventBus.requestReaction('main:addSocket', {
        socket: socket
    });
});
