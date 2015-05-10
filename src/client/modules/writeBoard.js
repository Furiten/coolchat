var _ = require('lodash');

module.exports = function(eventBus, registry) {
    var childModules = [
        require('./writeBoard/typing'),
        require('./writeBoard/chatField')
    ];

    eventBus.on('chat__userlistAppeared', function() {
        $('.controls').addClass('compact');
    });
    eventBus.on('chat__userlistDisappeared', function() {
        $('.controls').removeClass('compact');
    });

    _.each(childModules, function(module) {
        module(eventBus, registry);
    });
};
