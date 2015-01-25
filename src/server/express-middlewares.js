var express = require('express');
var session = require('express-session');
var redis = require('redis');
var RedisStore = require('connect-redis')(session);
var sessionStore = new RedisStore({
    client: redis.createClient(),
    host: 'localhost',
    port: 6379,
    prefix: 'coolchat_'
});
var passportSocketIo = require("passport.socketio");
var cookieParser = require('cookie-parser');

module.exports = function(app, io, passport) {
    app.use(cookieParser());
    app.use(express.static('public'));
    app.use(session({
        key: 'connect.sid',
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        secret: 'osdgju892u4ijwd'
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    io.use(passportSocketIo.authorize({
        cookieParser: cookieParser,
        key:         'connect.sid',       // the name of the cookie where express/connect stores its session_id
        secret:      'osdgju892u4ijwd',    // the session_secret to parse the cookie
        store:       sessionStore,        // we NEED to use a sessionstore. no memorystore please
        success:     onAuthorizeSuccess,  // *optional* callback on success - read more below
        fail:        onAuthorizeFail     // *optional* callback on fail/error - read more below
    }));

    function onAuthorizeSuccess(data, accept){
        console.log('successful connection to socket.io');
        accept();
    }

    function onAuthorizeFail(data, message, error, accept){
        console.log('failed connection to socket.io:', message);
        if (error) {
            accept(new Error(message));
        }
    }
};