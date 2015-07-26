var _ = require('lodash');
var log = require('../log');
var html = require('../../common/html.js');
var EventBus = require('../../common/eventBus');
var redis = require('../redis');
var io;

var onlineUsers = {};
var vkUsers = {};
var lastMessages = [];
var MAX_LAST_MSGS = 10;
var userIdsCounter = {}; // для чуваков, которые сидят с нескольких вкладок с одного аккаунта

function addMessageToLast(eventType, data) {
    if (_.where(lastMessages, {event: 'chat__message'}).length >= MAX_LAST_MSGS) {
        lastMessages.shift();
    }

    lastMessages.push({
        id: data.id, // user id
        date: new Date(),
        event: eventType,
        nickname: data.nickname,
        message: data.message,
        avatar: data.avatar
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

function getAvatar(profile) {
    if (profile._json && profile._json.picture) {
        return profile._json.picture;
    }

    if (profile.photos && profile.photos.length && profile.photos[0].value) {
        return profile.photos[0].value;
    }

    return null;
}

function incUserCounter(id) {
    userIdsCounter[id] = userIdsCounter[id] ? userIdsCounter[id] + 1 : 1;
}

function decUserCounter(id) {
    userIdsCounter[id] = userIdsCounter[id] ? userIdsCounter[id] - 1 : 0;
}

var controller = {
    'onPing': function(socket) {
        socket.emit('chat__pong');
    },

    'onConnect': function(socket) {
        var profile = socket.conn.request.user;
        onlineUsers[socket.conn.id] = profile;

        socket.emit('chat__identity', profile);

        socket.emit('chat__previousMessages', lastMessages);
        if (userIdsCounter[profile.id] == 0) {
            sendMessage('chat__userCame', {
                id: profile.id,
                nickname: profile.displayName,
                avatar: getAvatar(profile),
                link: profile.link
            }, socket);
        }
        incUserCounter(profile.id);
        socket.emit('chat__currentlyOnline', _.map(onlineUsers, function(el) {
            return {
                id: el.id,
                nickname: el.displayName,
                avatar: getAvatar(el),
                link: el.link
            };
        }));
        log('User #' + socket.conn.id + ' connected (' + profile.displayName + ')');
    },

    'onDisconnect': function(socket) {
        var profile = onlineUsers[socket.conn.id];
        if (profile !== undefined) {
            if (profile) {
                decUserCounter(profile.id);
                log('User ' + socket.conn.id + ' (' + profile.displayName + ') disconnected');
            }
            delete onlineUsers[socket.conn.id];
        }

        if (userIdsCounter[profile.id] == 0) {
            sendMessage('chat__userDisconnected', {
                id: profile.id,
                nickname: profile.displayName,
                avatar: getAvatar(profile),
                link: profile.link
            });
        }
    },

    'onChatMessage': function(socket, message) {
        message = html.strip(message);
        var profile = onlineUsers[socket.conn.id];
        log('User ' + profile.displayName + ' sent message: ' + message);
        sendMessage('chat__message', {
            id: profile.id,
            nickname: profile.displayName,
            avatar: getAvatar(profile),
            message: message
        });
    },

    'onTyping': function(socket) {
        var profile = onlineUsers[socket.conn.id];
        socket.broadcast.emit('chat__typing', {
            id: profile.id,
            nickname: profile.displayName
        });
    },

    'onTypingEnd': function(socket) {
        var profile = onlineUsers[socket.conn.id];
        socket.broadcast.emit('chat__stoppedTyping', {
            id: profile.id,
            nickname: profile.displayName
        });
    }
};

module.exports = function(_io) {
    io = _io;
    var methods = {
        addSocket: function(socket) {
            console.log('----------');
            controller.onConnect(socket);
            socket.on('disconnect', _.partial(controller.onDisconnect, socket));
            socket.on('chat__outgoingMessage', _.partial(controller.onChatMessage, socket));
            socket.on('chat__ping', _.partial(controller.onPing, socket));
            socket.on('chat__userTyping', _.partial(controller.onTyping, socket));
            socket.on('chat__userStoppedTyping', _.partial(controller.onTypingEnd, socket));
        },
        registerUser: function(accessToken, profile, onReady) {
            redis.set('reg_user_' + profile.id, JSON.stringify(profile));
            redis.expire('reg_user_' + profile.id, 604800); // expire in week
            // onReady(null, user); -> ok
            // onReady(null, false); -> incorrect password?
            // onReady(err); -> exception occured
            onReady(null, profile);
        },
        getUser: function(userId, cb) {
            redis.get('reg_user_' + userId, function(err, reply) {
                try {
                    var dbData = JSON.parse(reply);
                    if (err) {
                        throw new TypeError();
                    }
                } catch (e) {
                    cb(false);
                    return;
                }

                cb(dbData);
            });
        }
    };

    EventBus.handleReaction('main:addSocket', function(data, cb) {
        methods.addSocket(data.socket);
        cb();
    });

    EventBus.handleReaction('main:registerUser', function(data, cb) {
        methods.registerUser(data.accessToken, data.profile, cb);
    });

    EventBus.handleReaction('main:getUser', function(data, cb) {
        methods.getUser(data.userId, cb);
    });

    return methods;
};
