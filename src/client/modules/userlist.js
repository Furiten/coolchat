var _ = require('lodash');

module.exports = function(eventBus, registry) {
    var userList = {};
    var userListNode;
    var userListTemplate = require('../templates/userlist.hbs');

    eventBus.on('client__pageLoaded', initModule);
    eventBus.on('chat__userCame', addUser);
    eventBus.on('chat__userDisconnected', removeUser);
    eventBus.on('chat__currentlyOnline', addUsers);

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
        var id = data.nickname, /* TODO: заменить на норм айди */
            name = data.nickname,
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
        var id = data.nickname; /* TODO: заменить на норм айди */
        if (userList[id]) {
            delete userList[id];
            updateUserList();
        }
    }

    function addUsers(uList) {
        _.each(uList, function(user) {
            userList[user.nickname/* TODO: заменить на норм айди */] = {
                name: user.nickname,
                avatar: user.avatar,
                link: user.link
            };
        });

        updateUserList();
    }
};
