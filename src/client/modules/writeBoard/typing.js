var _ = require('lodash');
var hb = require('handlebars');

module.exports = function(eventBus, registry) {
    var typingUsers = {};
    var typingUsersCount = 0;
    var typingTimer = null;
    var typingTemplate;

    eventBus.on('client__pageLoaded', function() {
        typingTemplate = hb.compile($('#typing-tpl').html());
    });

    eventBus.on('chat__typing', addTypingUser);
    eventBus.on('chat__stoppedTyping', removeTypingUser);
    eventBus.on('client__keyEvent', function() {
        registerUserTyping(function() {
            eventBus.publish('chat__userTyping');
        }, function() {
            eventBus.publish('chat__userStoppedTyping');
        });
    });

    function addTypingUser(name) {
        if (!typingUsers[name]) {
            typingUsersCount++;
        }
        typingUsers[name] = 1;
        updateTypingText();
    }

    function removeTypingUser(name) {
        if (typingUsers[name]) {
            delete typingUsers[name];
            typingUsersCount--;
        }
        updateTypingText();
    }

    function updateTypingText() {
        if (typingUsersCount == 0) {
            $('.now_typing').html('');
        } else {
            $('.now_typing').html(typingTemplate({
                count: typingUsersCount,
                list: _.keys(typingUsers).join(', ')
            }));
        }
    }

    function registerUserTyping(onTypeStart, onTypeEnd) {
        function onEnd() {
            typingTimer = null;
            onTypeEnd();
        }

        if (typingTimer === null) {
            onTypeStart();
            typingTimer = window.setTimeout(onEnd, 500);
        } else {
            window.clearTimeout(typingTimer);
            typingTimer = window.setTimeout(onEnd, 500);
        }
    }
};




