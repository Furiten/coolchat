var _ = require('lodash');

module.exports = function(eventBus, registry) {
    var typingUsers = {};
    var typingUsersCount = 0;
    var typingTimer = null;
    var typingTemplate = require('../..//templates/typing.hbs');

    eventBus.on('chat__typing', addTypingUser);
    eventBus.on('chat__stoppedTyping', removeTypingUser);
    eventBus.on('client__keyEvent', function() {
        registerUserTyping(function() {
            eventBus.publish('chat__userTyping');
        }, function() {
            eventBus.publish('chat__userStoppedTyping');
        });
    });

    function addTypingUser(data) {
        if (!typingUsers[data.id]) {
            typingUsersCount++;
        }
        typingUsers[data.id] = data.nickname;
        updateTypingText();
    }

    function removeTypingUser(data) {
        if (typingUsers[data.id]) {
            delete typingUsers[data.id];
            typingUsersCount--;
        }
        updateTypingText();
    }

    function updateTypingText() {
        if (typingUsersCount == 0) {
            $('.now_typing').html('');
        } else {
            var data = {
                count: typingUsersCount,
                list: _.values(typingUsers).slice(0, 3).join(', '),
                othersCount: _.values(typingUsers).slice(3).length
            };
            $('.now_typing').html(typingTemplate(data));
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




