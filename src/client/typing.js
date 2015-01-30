var typingUsers = {};
var typingUsersCount = 0;
var typingTimer = null;
var typingTemplate;

var $ = require('jquery');
var _ = require('lodash');
var hb = require('handlebars');
$(function() {
    typingTemplate = hb.compile($('#typing-tpl').html());
});


function addTypingUser(name) {
    if (!typingUsers[name]) {
        typingUsersCount++;
    }
    typingUsers[name] = 1;
    updateTypingText();
}

function removeTypingUser(name) {
    if (typingUsers[name]) {
        delete typingUsers[name];
        typingUsersCount--;
    }
    updateTypingText();
}

function updateTypingText() {
    if (typingUsersCount == 0) {
        $('.now_typing').html('');
    } else {
        $('.now_typing').html(typingTemplate({
            count: typingUsersCount,
            list: _.keys(typingUsers).join(', ')
        }));
    }
}

function registerUserTyping(onTypeStart, onTypeEnd) {
    function onEnd() {
        typingTimer = null;
        onTypeEnd();
    }

    if (typingTimer === null) {
        onTypeStart();
        typingTimer = window.setTimeout(onEnd, 500);
    } else {
        window.clearTimeout(typingTimer);
        typingTimer = window.setTimeout(onEnd, 500);
    }
}

module.exports = {
    add: addTypingUser,
    remove: removeTypingUser,
    timer: registerUserTyping
};
