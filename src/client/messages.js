var $ = require('jquery');
var _ = require('lodash');
var hb = require('handlebars');
var msgTemplate, chatField;
var dateFormat = require('../common/dateformat');
var html = require('../common/html');
var unread = require('./unread-notifications');
//var emoji = require('emoji');

$(function() {
    chatField = $('.field_chat');
    msgTemplate = hb.compile($('#message-tpl').html());
});

function showMessage(msg) {
    chatField.append(msgTemplate({
        userMessage: msg.type == 'userMessage',
        userCame: msg.type == 'userCame',
        userWentAway: msg.type == 'userWentAway',
        dateTime: dateFormat.pattern(msg.date, 'Y-m-d @ H:i:s'),
        username: msg.username,
        avatar: msg.avatar,
        content: msg.content ? msgPrefilters(msg.content) : null
    }));

    window.scrollTo(0, document.body.scrollHeight + 100);
}


function msgPrefilters(msg) {
    msg = html.nl2br(msg);
//    msg = emoji.unifiedToHTML(msg); // TODO: emoji in textarea, see client/emojiarea.js
    return msg;
}

function userLoggedIn(data) {
    showMessage({
        username: data.nickname,
        avatar: data.avatar,
        date: data.date ? new Date(data.date) : new Date(),
        type: 'userCame'
    });
}

function userMessage(data) {
    showMessage({
        content: data.message,
        username: data.nickname,
        avatar: data.avatar,
        date: data.date ? new Date(data.date) : new Date(),
        type: 'userMessage'
    });

    unread.onNewMessage(data);
}

function userWentAway(data) {
    showMessage({
        username: data.nickname,
        avatar: data.avatar,
        date: data.date ? new Date(data.date) : new Date(),
        type: 'userWentAway'
    });
}

function showPrevMessages(messagesList) {
    _.each(messagesList, function(msg) {
        switch(msg.event) {
            case 'chat__message':
                userMessage(msg);
                break;
            case 'chat__userDisconnected':
                userWentAway(msg);
                break;
            case 'chat__userCame':
                userLoggedIn(msg);
                break;
            default:
        }
    })
}

module.exports = {
    userLoggedIn: userLoggedIn,
    userWentAway: userWentAway,
    userMessage: userMessage,
    showPrevMessages: showPrevMessages,
    compactify: function() {
        chatField.addClass('compact');
    },
    restoreSize: function() {
        chatField.removeClass('compact');
    }
};