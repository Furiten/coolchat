var EventBus = require('../../common/eventBus');
var versions = require('../../common/version-config');
var path = require('path');

module.exports = function(app) {
    function setAuthCookie(res, cookie, del) {
        res.cookie(versions.authCookieName, cookie, {
            // todo: не ставится с доменом. разобраться
            //domain: versions.cookieDomain,
            expires: del ? new Date(Date.now() - 1000*60*60*24*7) : new Date(Date.now() + 1000*60*60*24*7)
        });
    }

    app.get('/', function(req, res) {
        var userCookie = req.cookies[versions.authCookieName] || req.query[versions.authCookieName];
        EventBus.requestReaction('auth:authorizeUser', {
            cookieValue: userCookie
        }, function(err, data, cookie) {
            if (err) {
                res.sendFile(path.resolve(__dirname + '/../../../build/static/select_auth_provider.html'));
                return;
            }

            setAuthCookie(res, cookie);
            // todo: update user expiration in redis here
            res.sendFile(path.resolve(__dirname + '/../../../build/static/index.html'));
        })
    });

    app.get('/logout', function(req, res) {
        EventBus.requestReaction('auth:logoutUser', {
            cookieValue: req.cookies[versions.authCookieName]
        }, function() {
            setAuthCookie(res, '', true);
            res.redirect('/');
        });
    });
};
