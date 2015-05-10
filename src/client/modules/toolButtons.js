var _ = require('lodash');

module.exports = function(eventBus, registry) {
    // 1) userlist button

    var usersCount = 0;
    var userCountNode;
    var usersHash = {};

    eventBus.on('client__pageLoaded', initUserCountButton);
    eventBus.on('chat__userCame', addUser);
    eventBus.on('chat__userDisconnected', removeUser);
    eventBus.on('chat__currentlyOnline', addUsers);

    function initUserCountButton() {
        userCountNode = $('.userlist_count');
        var popup = $('.userlist_button').popup({
            target: '.userlist_button_container',
            popup: '.popup.userlist',
            on: 'click',
            hoverable: false,
            movePopup: false,
            onShow: function () {
                eventBus.publish('chat__userlistAppeared');
            },
            onHidden: function () {
                eventBus.publish('chat__userlistDisappeared');
            }
        });
    }

    function addUser(data) {
        var id = data.nickname; /* TODO: заменить на норм айди */
        if (!usersHash[id]) {
            userCountNode.html(++usersCount);
            usersHash[id] = 1;
        }
    }

    function removeUser(data) {
        var id = data.nickname; /* TODO: заменить на норм айди */
        if (usersHash[id]) {
            userCountNode.html(--usersCount);
            delete usersHash[id];
        }
    }

    function addUsers(uList) {
        _.each(uList, function(user) {
            if (!usersHash[user.nickname/* TODO: заменить на норм айди */]) {
                usersCount++;
                usersHash[user.nickname/* TODO: заменить на норм айди */] = 1;
            }
        });

        userCountNode.html(usersCount);
    }

    // 2) setting button

    $(".settings_button").on('click', function() {
        eventBus.publish('chat__settingsButtonClicked');
    });

    // 3) logout button

    $('.logout_button').on('click', function() {
        eventBus.publish('chat__logoutButtonClicked');
    });
};
