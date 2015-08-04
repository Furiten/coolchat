var _ = require('lodash');
var redis = require('../redis');
var uuid = require('node-uuid');
var EventBus = require('../../common/eventBus');
/**
 * Authorization component
 * Works with redis to store user in local storage.
 */
var AuthComponent = function() {};

/**
 * When cookie exists, use that cookie to retrieve user info.
 * In this case, user is considered authorized and all needed actions are performed
 * (such as sending message to common chat, adding to user list, etc)
 */
AuthComponent.prototype.authorizeUser = function(cookieValue, cb) {
    if (!cookieValue) {
        cb({reason: 'Unauthorized user'});
        return;
    }

    var parts = cookieValue.split('__');
    redis.get('user_' + parts[0], function(err, reply) {
        try {
            var dbData = JSON.parse(reply);
            if (err || dbData.cookie != parts[1]) {
                throw new TypeError();
            }
        } catch (e) {
            cb({reason: 'Unauthorized user'});
            return;
        }

        cb(null, dbData.data, dbData.data.id + '__' + dbData.cookie);
    });
};

/**
 * Save user credentials to session db when
 * user logs out using remote provider. No existing data entries
 * are taken into consideration.
 */
AuthComponent.prototype.saveUser = function(data) {
    var cookie = this.generateCookie();
    redis.set('user_' + data.id, JSON.stringify({
        cookie: cookie,
        data: data
    }));
    redis.expire('user_' + data.id, 604800); // expire in week
    return data.id + '__' + cookie;
};

/**
 * Remove active user from session db
 */
AuthComponent.prototype.logoutUser = function(cookieValue) {
    if (!cookieValue) return;
    var parts = cookieValue.split('__');
    redis.get('user_' + parts[0], function(err, reply) {
        try {
            var dbData = JSON.parse(reply);
            if (err || dbData.cookie != parts[1]) {
                throw new TypeError();
            }
        } catch (e) {
            return;
        }

        redis.del('user_' + dbData.data.id);
    });

};

AuthComponent.prototype.generateCookie = function() {
    return uuid.v4();
};

var auth = new AuthComponent();
module.exports = auth;

EventBus.handleReaction('auth:authorizeUser', function(data, cb) {
    auth.authorizeUser(data.cookieValue, cb);
});

EventBus.handleReaction('auth:saveUser', function(data, cb) {
    cb(auth.saveUser(data));
});

EventBus.handleReaction('auth:logoutUser', function(data, cb) {
    auth.logoutUser(data.cookieValue);
    cb();
});

EventBus.handleReaction('auth:generateCookie', function(data, cb) {
    cb(auth.generateCookie());
});


