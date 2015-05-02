var _ = require('lodash');

module.exports = function(eventBus, registry) {
    var childModules = [
        require('./writeBoard/typing'),
        require('./writeBoard/chatField')
    ];

    _.each(childModules, function(module) {
        module(eventBus, registry);
    });
};
