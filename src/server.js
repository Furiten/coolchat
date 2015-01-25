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

// Exec middlewares for express and socket.io
require('./server/express-middlewares')(app, io, passport);

var servedFiles = {
    '/chat/': 'index.html',
    '/failedToEnter/': 'failed.html',
    '/bundle.js': 'bundle.js',
    '/build/bundle.map.json': 'bundle.map.json', // debug only!
    '/styles.css': 'styles.css',
    '/emoji.css': 'emoji.css',
    '/emoji.png': 'emoji.png',
    '/message.mp3': 'message.mp3'
};

_.each(servedFiles, function(value, key) {
    app.get(key, function(req, res) {
        res.sendFile(path.resolve(__dirname + '/../build/' + value));
    });
});

// Passport-vkontakte authentication entry point
app.get('/',
    passport.authenticate('vkontakte'),
    function(req, res){
        // The request will be redirected to vk.com for authentication, so
        // this function will not be called.
    }
);

// Passport-vkontakte callback
app.get('/auth/vkontakte/callback',
    passport.authenticate('vkontakte', { failureRedirect: '/failedToEnter/' }),
    function(req, res) {
        res.redirect('/chat/');
    }
);

http.listen(3000, function() {
    console.log('listening on *:3000');
});

io.on('connection', controller.addSocket);
