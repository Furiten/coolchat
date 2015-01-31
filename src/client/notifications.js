var $ = require('jquery');
$(initNotifications);

var notificationsEnabled = true;
var notificationPermission = 'denied';

function initNotifications() {
    if (!notificationsSupported()) {
        disableNotifications();
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
    if (notificationsEnabled && notificationPermission == 'granted') {
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
}

function enableNotifications() {
    notificationsEnabled = notificationsSupported();
}

function disableNotifications() {
    notificationsEnabled = false;
}

function notificationsSupported() {
    return !!window.Notification;
}

module.exports = {
    notify: notify,
    enable: enableNotifications,
    disable: disableNotifications,
    supported: notificationsSupported
};
