var unreadEnabled = false;
var unreadMessagesCount = 0;
var sound = require('./sound');
var windowTitle = require('./window-title');

module.exports = {
    onNewMessage: function() {
        if (unreadEnabled) {
            sound.play();
            windowTitle.update(++unreadMessagesCount);
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
