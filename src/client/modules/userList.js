var _ = require('lodash');

module.exports = function(eventBus, registry) {
    var userList = {};
    var userListNode;
    var userListTemplate = require('../templates/userlist.hbs');

    eventBus.on('client__pageLoaded', initModule);
    eventBus.on('chat__userCame', addUser);
    eventBus.on('chat__userDisconnected', removeUser);
    eventBus.on('chat__currentlyOnline', addUsers);
    eventBus.on('chat__userlistAppeared', function() {
        userListNode.addClass('active');
    });
    eventBus.on('chat__userlistDisappeared', function() {
        userListNode.removeClass('active');
    });

    function initModule() {
        require('perfect-scrollbar');
        userListNode = $('.userlist');

        updateUserList();

        $('.scroller').perfectScrollbar({
            suppressScrollX: true
        });
    }

    function updateUserList() {
        userListNode.html(userListTemplate({
            users: userList
        }));
    }

    function addUser(data) {
        var id = data.id,
            name = data.nickname.split(' ')[0], // TODO: заменить на имя из поля
            avatar = data.avatar,
            link = data.link;

        userList[id] = {
            name: name,
            avatar: avatar,
            link: link
        };

        updateUserList();
    }

    function removeUser(data) {
        var id = data.id;
        if (userList[id]) {
            delete userList[id];
            updateUserList();
        }
    }

    function addUsers(uList) {
        _.each(uList, function(user) {
            userList[user.id] = {
                name: user.nickname.split(' ')[0], // TODO: заменить на имя из поля
                avatar: user.avatar,
                link: user.link
            };
        });

        updateUserList();
    }
};
