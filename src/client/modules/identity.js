var _ = require('lodash');

module.exports = function(eventBus, registry) {
    eventBus.on('chat__identity', function(profile) {
        registry.set('identity', profile);
    });
};
