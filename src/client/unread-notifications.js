var unreadEnabled = false;
var unreadMessagesCount = 0;
var sound = require('./sound');
var windowTitle = require('./window-title');
var notifications = require('./notifications');

module.exports = {
    onNewMessage: function(message) {
        if (unreadEnabled) {
            sound.play();
            windowTitle.update(++unreadMessagesCount);
            notifications.notify(message.nickname, message.avatar, message.message);
        }
    },
    enable: function() {
        unreadEnabled = true;
    },
    disable: function() {
        unreadEnabled = false;
        unreadMessagesCount = 0;
        windowTitle.update(false);
    }
};
