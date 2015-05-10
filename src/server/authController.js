var _ = require('lodash');
var versions = require('../common/version-config');
var redis = require('./redis');
var uuid = require('node-uuid');

var AuthController = function() {};
AuthController.prototype.authorizeUser = function(cookieValue, cb) {
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

AuthController.prototype.saveUser = function(data) {
    var cookie = this.generateCookie();
    redis.set('user_' + data.id, JSON.stringify({
        cookie: cookie,
        data: data
    }));
    redis.expire('user_' + data.id, 604800); // expire in week
    return data.id + '__' + cookie;
};

AuthController.prototype.logoutUser = function(cookieValue) {
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

AuthController.prototype.generateCookie = function() {
    return uuid.v4();
};

// export
var authController = new AuthController();
module.exports = authController;
