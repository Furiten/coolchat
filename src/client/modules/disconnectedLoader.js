var _ = require('lodash');
var versions = require('../../common/version-config');

module.exports = function(eventBus, registry) {
    eventBus.on('client__pageLoaded', function() {
        $('.reload_page').on('click', onReloadPageClicked);
    });

    eventBus.on('disconnect', showPreloader);
    eventBus.on('chat__pong', hidePreloader);

    function onReloadPageClicked(e) {
        e.preventDefault();
        document.cookie = versions.authCookieName + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.reload();
    }

    function showPreloader() {
        $('.loader_overlay').show();
    }

    function hidePreloader() {
        $('.loader_overlay').hide();
    }
};
