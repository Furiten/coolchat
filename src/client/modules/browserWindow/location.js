var versions = require('../../../common/version-config');

module.exports = function(eventBus, registry) {
    // clean location on page loaded (remove auth cookie name via history api)
    eventBus.on('client__pageLoaded', function() {
        var loc = window.location.href;
        if (loc.indexOf(versions.authCookieName) != -1) {
            var newLoc = loc.replace(new RegExp('\\?' + versions.authCookieName + '=([^&]+)'), '');
            window.history.replaceState({}, undefined, newLoc);
        }
    });
};
