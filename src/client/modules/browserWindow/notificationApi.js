/**
 * Notification API Popups
 * @type {exports}
 */
var _ = require('lodash');

module.exports = function(eventBus, registry) {
    var notificationsEnabled = true;
    var notificationPermission = 'denied';

    eventBus.on('client__pageLoaded', initNotifications);
    eventBus.on('chat__message', function(message) {
        notify(message.nickname, message.avatar, message.message);
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
        if (registry.get('notifications.popup') == 'off') return;
        if (!notificationsEnabled || notificationPermission != 'granted') return;

        var notification = new Notification(username, {
            body : message,
            icon : usericon
        });

        notification.onshow = function() {
            setTimeout(function() {
                notification.close();
            }, 2000);
        }
    }
};
