var passport = require('passport');
var VKontakteStrategy = require('passport-vkontakte').Strategy;
var VKONTAKTE_APP_ID = 4748780;
var VKONTAKTE_APP_SECRET = "tRm4vKRx8gdWio75Cg1t";

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

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (userId, done) {
        done(null, controller.getUser(userId));
    });

    return passport;
};

