var passport = require('passport');
var VKontakteStrategy = require('passport-vkontakte').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var VKONTAKTE_APP_ID = 4748780;
var VKONTAKTE_APP_SECRET = "tRm4vKRx8gdWio75Cg1t";

var GOOGLE_CLIENT_ID = '329753295705-tllhaeiffhnjhl2bt6588bh2n9mrof3p.apps.googleusercontent.com';
var GOOGLE_CLIENT_SECRET = 'FudPQ453Of5L2t7yjB3YAXIa';

module.exports = function(controller) {
    passport.use(new VKontakteStrategy({
            clientID: VKONTAKTE_APP_ID,
            clientSecret: VKONTAKTE_APP_SECRET,
            callbackURL: "http://localhost:3000/auth/vkontakte/callback"
        },
        function (accessToken, refreshToken, profile, done) {
            controller.registerUser(accessToken, profile, done);
        }
    ));

    passport.use(new GoogleStrategy({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            controller.registerUser(accessToken, profile, done);
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (userId, done) {
        controller.getUser(userId, function(data) {
            done(null, data);
        });
    });

    return passport;
};

