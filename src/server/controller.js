var _ = require('lodash');
var log = require('./log');
var html = require('../common/html.js');
var io;

var onlineUsers = {};
var vkUsers = {};
var lastMessages = [];
var MAX_LAST_MSGS = 10;

function addMessageToLast(eventType, data) {
    if (lastMessages.length >= MAX_LAST_MSGS) {
        lastMessages.shift();
    }

    lastMessages.push({
        date: new Date(),
        event: eventType,
        nickname: data.nickname,
        message: data.message
    });
}

function sendMessage(eventType, data, excludeSelfSocket) {
    addMessageToLast.apply(null, arguments);
    if (excludeSelfSocket) {
        excludeSelfSocket.broadcast.emit(eventType, data);
    } else {
        io.emit(eventType, data);
    }
}

var controller = {
    'onConnect': function(socket) {
        var profile = socket.conn.request.user;
        onlineUsers[socket.conn.id] = profile.displayName;
        sendMessage('chat__userCame', {
            nickname: profile.displayName
        }, socket);
        socket.emit('chat__previousMessages', lastMessages);
        log('User #' + socket.conn.id + ' connected (' + profile.displayName + ')');
    },

    'onDisconnect': function(socket) {
        if (onlineUsers[socket.conn.id] !== undefined) {
            if (onlineUsers[socket.conn.id]) {
                sendMessage('chat__userDisconnected', {
                    nickname: onlineUsers[socket.conn.id]
                });
                log('User ' + onlineUsers[socket.conn.id] + ' disconnected');
            }
            delete onlineUsers[socket.conn.id];
        }
    },

    'onChatMessage': function(socket, message) {
        message = html.strip(message);
        log('User ' + onlineUsers[socket.conn.id] + ' sent message: ' + message);
        sendMessage('chat__message', {
            nickname: onlineUsers[socket.conn.id],
            message: message
        });
    }
};

module.exports = function(_io) {
    io = _io;
    return {
        addSocket: function(socket) {
            controller.onConnect(socket);
            socket.on('disconnect', _.partial(controller.onDisconnect, socket));
            socket.on('chat__message', _.partial(controller.onChatMessage, socket));
        },
        registerUser: function(accessToken, profile, onReady) {
            // onReady(null, user); -> ok
            // onReady(null, false); -> incorrect password?
            // onReady(err); -> exception occured
            vkUsers[profile.id] = profile;
            onReady(null, profile);
        },
        getUser: function(userId) {
            return vkUsers[userId] || false;
        }
    };
};