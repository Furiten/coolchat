var _ = require('lodash');

module.exports = function(eventBus, registry) {
    var childModules = [
        require('./browserWindow/notificationApi'),
        require('./browserWindow/soundApi'),
        require('./browserWindow/windowTitle'),
        require('./browserWindow/location')
    ];

    _.each(childModules, function(module) {
        module(eventBus, registry);
    });
};
