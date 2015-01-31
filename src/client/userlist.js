var _ = require('lodash');
var $ = require('jquery');
var hb = require('handlebars');
var messages = require('./messages');
require('perfect-scrollbar');
var usersCount = 0;
var userList = {};
var userListNode;
var userListTemplate;
var userCountNode;

$(function() {
    userListNode = $('.userlist');
    userListTemplate = hb.compile($('#user-list').html());
    userCountNode = $('.userlist_count');

    updateUserList();
    var popup = $('.userlist_button').popup({
        target: '.userlist_button_container',
        popup: '.popup.userlist',
        on: 'click',
        hoverable: false,
        movePopup: false,
        onShow: messages.compactify,
        onHidden: messages.restoreSize
    });

    $('.scroller').perfectScrollbar({
        suppressScrollX: true
    });
});

function updateUserList() {
    userListNode.html(userListTemplate({
        users: userList
    }));
    userCountNode.html(usersCount);
}

function addUser(id, name, avatar, link) {
    if (!userList[id]) {
        usersCount++;
    }
    userList[id] = {
        name: name,
        avatar: avatar,
        link: link
    };
    updateUserList();
}

function removeUser(id) {
    if (userList[id]) {
        delete userList[id];
        usersCount--;
        updateUserList();
    }
}

function addUsers(uList) {
    _.each(uList, function(user) {
        if (!userList[user.nickname/* TODO: заменить на норм айди */]) {
            usersCount++;
        }
        userList[user.nickname/* TODO: заменить на норм айди */] = {
            name: user.nickname,
            avatar: user.avatar,
            link: user.link
        };
    });

    updateUserList();
}

module.exports = {
    add: addUser,
    remove: removeUser,
    addUsers: addUsers
};
