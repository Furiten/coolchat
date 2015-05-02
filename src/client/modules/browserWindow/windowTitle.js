/**
 * Notifications through window title
 * @type {exports}
 */

var _ = require('lodash');

module.exports = function(eventBus, registry) {
    var unreadInterval = null;
    var unreadCount = 0;
    var pageActive = true;

    eventBus.on('chat__message', function() {
        if (pageActive) return clearTitle();

        unreadCount++;
        updateTitle(unreadCount);
    });

    eventBus.on('client__windowBlurred', function() {
        pageActive = false;
    });

    eventBus.on('client__windowFocused', function() {
        pageActive = true;
        clearTitle();
    });

    function clearTitle() {
        if (unreadInterval) {
            var title = $('title');
            clearInterval(unreadInterval);
            unreadInterval = null;
            title.html(title.attr('data-original'));
            title.removeAttr('data-original');
        }
        unreadCount = 0;
    }

    function updateTitle(messagesCount) {
        if (settings.get('notifications.title') == 'off') {
            clearTitle();
            return;
        }

        var title = $('title');
        if (messagesCount) {
            if (unreadInterval) {
                clearInterval(unreadInterval);
                unreadInterval = null;
            }

            if (!title.attr('data-original')) {
                title.attr('data-original', title.html());
            }

            unreadInterval = setInterval(function() {
                if (title.attr('data-original') != title.html()) {
                    title.html(title.attr('data-original'));
                } else {
                    title.html(messagesCount + ' messages');
                }
            }, 2000);
        } else {
            clearTitle();
        }
    }
};
