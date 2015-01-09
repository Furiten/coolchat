/**
 * Server-side entry point
 */

var _ = require('lodash');
var app = require('express')();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);

var controller = require('./server/controller')(io);

var servedFiles = {
    '/': 'index.html',
    '/bundle.js': 'bundle.js',
    '/build/bundle.map.json': 'bundle.map.json', // debug only!
    '/styles.css': 'styles.css'
};

_.each(servedFiles, function(value, key) {
    app.get(key, function(req, res) {
        res.sendFile(path.resolve(__dirname + '/../build/' + value));
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});

io.on('connection', controller.addSocket);