var $ = require('jquery');
var unreadInterval = null;

function updateTitle(messagesCount) {
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
        if (unreadInterval) {
            window.clearInterval(unreadInterval);
            unreadInterval = null;
            title.html(title.attr('data-original'));
            title.removeAttr('data-original');
        }
    }
}

module.exports = {
    update: updateTitle
};
