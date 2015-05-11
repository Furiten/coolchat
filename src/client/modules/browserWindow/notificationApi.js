/**
 * Notification API Popups
 * @type {exports}
 */
var _ = require('lodash');

module.exports = function(eventBus, registry) {
    var notificationsEnabled = true;
    var notificationPermission = 'denied';
    var pageActive = true;

    eventBus.on('client__pageLoaded', initNotifications);
    eventBus.on('chat__message', function(message) {
        if (registry.get('notifications.popup') == 'off') return;
        if (registry.get('notifications.popup') == 'inactive_page' && pageActive) return;
        if (!notificationsEnabled || notificationPermission != 'granted') return;

        notify(message.nickname, message.avatar, message.message);
    });
    eventBus.on('client__windowBlurred', function() {
        pageActive = false;
    });
    eventBus.on('client__windowFocused', function() {
        pageActive = true;
    });

    function initNotifications() {
        if (!window.Notification) {
            notificationsEnabled = false;
            return;
        }

        switch (Notification.permission.toLowerCase()) {
            case "granted":
                notificationPermission = 'granted';
                break;
            case "denied": // нельзя, ну и ладно
                break;
            case "default":
                Notification.requestPermission(function (state) {
                    notificationPermission = state.toLowerCase();
                });
        }
    }

    function notify(username, usericon, message) {
        var notification = new Notification(username, {
            body : message,
            icon : usericon,
            tag: 'chat__messageNotification'
        });

        notification.onshow = function() {
            setTimeout(function() {
                notification.close();
            }, 2000);
        }
    }
};
