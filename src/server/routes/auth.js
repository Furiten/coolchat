var _ = require('lodash');
var versions = require('../../common/version-config');

module.exports = function(app, passport) {
    app.get('/auth/vkontakte', passport.authenticate('vkontakte', { failureRedirect: '/failedToEnter/' }));
    app.get('/auth/google', passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/plus.login'}));

    app.get('/auth/vkontakte/callback',
        passport.authenticate('vkontakte', { failureRedirect: '/failedToEnter/' }),
        function(req, res) {
            res.redirect('/?' + versions.authCookieName + '=' + versions.authCookieHash);
        }
    );

    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/failedToEnter/' }),
        function(req, res) {
            res.redirect('/?' + versions.authCookieName + '=' + versions.authCookieHash);
        });
};
