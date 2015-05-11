var _ = require('lodash');

module.exports = function(eventBus, registry) {
    // 1) userlist button

    var usersCount = 0;
    var userCountNode, userlistButtonNode;
    var usersHash = {};
    var userlistVisible = false;

    eventBus.on('client__pageLoaded', initUserCountButton);
    eventBus.on('chat__userCame', addUser);
    eventBus.on('chat__userDisconnected', removeUser);
    eventBus.on('chat__currentlyOnline', addUsers);
    eventBus.on('chat__userlistAppeared', function() {
        userlistButtonNode.addClass('active');
    });
    eventBus.on('chat__userlistDisappeared', function() {
        userlistButtonNode.removeClass('active');
    });

    function initUserCountButton() {
        userCountNode = $('.userlist_count');
        userlistButtonNode = $('.userlist_button');
        userlistButtonNode.on('click', function() {
            userlistVisible = !userlistVisible;
            eventBus.publish(userlistVisible ? 'chat__userlistAppeared' : 'chat__userlistDisappeared');
        });
    }

    function addUser(data) {
        var id = data.id;
        if (!usersHash[id]) {
            userCountNode.html(++usersCount);
            usersHash[id] = 1;
        }
    }

    function removeUser(data) {
        var id = data.id;
        if (usersHash[id]) {
            userCountNode.html(--usersCount);
            delete usersHash[id];
        }
    }

    function addUsers(uList) {
        _.each(uList, function(user) {
            if (!usersHash[user.id]) {
                usersCount++;
                usersHash[user.id] = 1;
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
