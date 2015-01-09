var _ = require('lodash');
var log = require('./log');
var io;

var onlineUsers = {};
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
        onlineUsers[socket.conn.id] = null; // no username yet
        log('User #' + socket.conn.id + ' connected');
    },

    'onDisconnect': function(socket) {
        if (onlineUsers[socket.conn.id] !== undefined) {
            sendMessage('chat__userDisconnected', {
                nickname: onlineUsers[socket.conn.id]
            });
            log('User ' + onlineUsers[socket.conn.id] + ' disconnected');
            delete onlineUsers[socket.conn.id];
        }
    },

    'onNicknameFound': function(socket, nickname) {
        onlineUsers[socket.conn.id] = nickname; // got username
        sendMessage('chat__userCame', {
            nickname: nickname
        }, socket);
        socket.emit('chat__previousMessages', lastMessages);
        log('User #' + socket.conn.id + ' sent nickname: ' + nickname);
    },

    'onChatMessage': function(socket, message) {
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
            socket.on('chat__nickname', _.partial(controller.onNicknameFound, socket));
            socket.on('chat__message', _.partial(controller.onChatMessage, socket));
        }
    };
};