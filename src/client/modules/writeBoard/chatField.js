var _ = require('lodash');

module.exports = function(eventBus, registry) {
    var msgField;

    eventBus.on('client__pageLoaded', function() {
        msgField = $('.field_message');
        msgField.trigger('focus');
        msgField.on('keydown', processTextInput);
    });

    function processTextInput(event) {
        if (event.keyCode == 13 && !event.shiftKey) { // enter
            event.preventDefault();
            eventBus.publish('chat__outgoingMessage', msgField.val());
            msgField.val('');
        }

        if (!event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
            eventBus.publish('client__keyEvent', event);
        }
    }
};
