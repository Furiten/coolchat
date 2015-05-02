/**
 * Notifications through window title
 * @type {exports}
 */

var settings = require('./settings');
var $ = require('jquery');
var unreadInterval = null;

function clearTitle() {
    if (unreadInterval) {
        var title = $('title');
        window.clearInterval(unreadInterval);
        unreadInterval = null;
        title.html(title.attr('data-original'));
        title.removeAttr('data-original');
    }
}

function updateTitle(messagesCount) {
    if (settings.get('notifications.title') == 'off') {
        clearTitle();
        return;
    }

    var title = $('title');
    if (messagesCount) {
        if (unreadInterval) {
            window.clearInterval(unreadInterval);
            unreadInterval = null;
        }

        if (!title.attr('data-original')) {
            title.attr('data-original', title.html());
        }

        unreadInterval = window.setInterval(function() {
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

module.exports = {
    update: updateTitle
};
