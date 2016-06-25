var passport = require('passport');
var VKontakteStrategy = require('passport-vkontakte').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var VKONTAKTE_APP_ID = 4748780;
var VKONTAKTE_APP_SECRET = "tRm4vKRx8gdWio75Cg1t";

var GOOGLE_CLIENT_ID = '329753295705-0v9lktlhcm8820as3bfu02dafi73uov1.apps.googleusercontent.com';
var GOOGLE_CLIENT_SECRET = 'puxrh25JM3wUVmXLwz1_bnAn';

var EventBus = require('../../common/eventBus');

/**
 * Passport middlewares:
 * Not exactly a component, but a wrapper to instantiate passport.js
 * then pass strategies in, and also define actions on user serialization
 * and deserialization to/from session db
 */
module.exports = function() {
    passport.use(new VKontakteStrategy({
            clientID: VKONTAKTE_APP_ID,
            clientSecret: VKONTAKTE_APP_SECRET,
            callbackURL: "http://talk.furiten.ru/auth/vkontakte/callback"
        },
        function (accessToken, refreshToken, profile, done) {
            EventBus.requestReaction('main:registerUser', {
                accessToken: accessToken,
                profile: profile
            }, done);
        }
    ));

    passport.use(new GoogleStrategy({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "http://talk.furiten.ru/auth/google/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            EventBus.requestReaction('main:registerUser', {
                accessToken: accessToken,
                profile: profile
            }, done);
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (userId, done) {
        EventBus.requestReaction('main:getUser', {
            userId: userId
        }, function(reply) {
            done(null, reply);
        });
    });

    return passport;
};

