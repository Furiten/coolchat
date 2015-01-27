/**
 * Client-side entry point
 */

var _ = require('lodash');
var $ = require('jquery');
window.$ = window.jQuery = $;
var dateFormat = require('./common/dateformat');
var html = require('./common/html');
var io = require('socket.io-client');
var emoji = require('emoji');

var socket,
    msgField,
    chatField,
    unreadEnabled = false,
    unreadMessagesCount = 0,
    unreadInterval = null,
    sound,
    soundEnabled = false;

function showMessage(content, date, msgtype) {
    var date = '<div class="right floated ui horizontal label">' + dateFormat.pattern(date, 'Y-m-d H:i:s') + '</div></div>';
    chatField.append("<div class='chat_message ui segment'>" +
        msgPrefilters(content) +
        date +
    "</div>");
}

function updateTitle(messagesCount) {
    var title = $('title');
    if (messagesCount) {
        if (unreadInterval) {
            window.clearInterval(unreadInterval);
            unreadInterval = null;
        }

        if (!title.attr('data-original')) {
            title.attr('data-original', title.html());
        }

        unreadInterval = window.setInterval(function() {
            if (title.attr('data-original') != title.html()) {
                title.html(title.attr('data-original'));
            } else {
                title.html(messagesCount + ' messages');
            }
        }, 2000);
    } else {
        if (unreadInterval) {
            window.clearInterval(unreadInterval);
            unreadInterval = null;
            title.html(title.attr('data-original'));
            title.removeAttr('data-original');
        }
    }
}

function msgPrefilters(msg) {
    msg = html.nl2br(msg);
//    msg = emoji.unifiedToHTML(msg); // TODO: emoji in textarea, see client/emojiarea.js
    return msg;
}

function userLoggedIn(data) {
    var content = ' К нам приходит ' + data.nickname + '!';
    showMessage(content, new Date());
}

function userMessage(data) {
    var content = ' <b>' + data.nickname + '</b>: ' + data.message;
    showMessage(content, new Date());
    if (soundEnabled) {
        sound.play();
    }
    if (unreadEnabled) {
        updateTitle(++unreadMessagesCount);
    }
}

function userWentAway(data) {
    var content = ' От нас уходит ' + data.nickname + '.';
    showMessage(content, new Date());
}

function showPrevMessages(messagesList) {
    messagesList.reverse();
    _.each(messagesList, function(msg) {
        var content;
        var date = new Date(msg.date);
        switch(msg.event) {
            case 'chat__message':
                content = ' <b>' + msg.nickname + '</b>: ' + msg.message;
                break;
            case 'chat__userDisconnected':
                content = ' От нас уходит ' + msg.nickname + '.';
                break;
            case 'chat__userCame':
                content = ' К нам приходит ' + msg.nickname + '!';
                break;
            default:
                return;
        }

        showMessage(content, date);
    })
}

function processTextInput(event) {
    if (event.keyCode == 13 && !event.shiftKey) { // enter
        event.preventDefault();
        socket.emit('chat__message', msgField.val());
        msgField.val('');
    }
}

$(function() {
    socket = io();
    msgField = $('.field_message');
    chatField = $('.field_chat');
    sound = document.getElementById('chat_messageSound');
    $('#chat_messageSound').attr('src', 'message.mp3');

    msgField.on('keydown', processTextInput);

    socket.on('chat__userCame', userLoggedIn);
    socket.on('chat__message', userMessage);
    socket.on('chat__userDisconnected', userWentAway);
    socket.on('chat__previousMessages', showPrevMessages);

    msgField.trigger('focus');

    $(window).focus(function() {
        soundEnabled = false;
        unreadEnabled = false;
        unreadMessagesCount = 0;
        updateTitle(false);
    });
    $(window).blur(function() {
        soundEnabled = true;
        unreadEnabled = true;
        chatField.find('.chat_message').css('border-bottom', '0px');
        chatField.find('.chat_message').last().css('border-bottom', '1px solid #333');
    });
});