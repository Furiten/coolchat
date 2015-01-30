/**
 * Client-side entry point
 */

var _ = require('lodash');
var hb = require('handlebars');
var $ = require('jquery');
window.$ = window.jQuery = $;
var dateFormat = require('./common/dateformat');
var versions = require('./common/version-config');
var html = require('./common/html');
var io = require('socket.io-client');
var emoji = require('emoji');

function cleanLocation() {
    var loc = window.location.href;
    if (loc.indexOf(versions.authCookieName) != -1) {
        var newLoc = loc.replace(new RegExp('\\?' + versions.authCookieName + '=([^&]+)'), '');
        window.history.replaceState({}, undefined, newLoc);
    }
}

var socket,
    msgField,
    chatField,
    unreadEnabled = false,
    unreadMessagesCount = 0,
    unreadInterval = null,
    sound,
    msgTemplate,
    soundEnabled = false;

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

    window.scrollTo(0, document.body.scrollHeight + 70);
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

    if (soundEnabled) {
        sound.play();
    }
    if (unreadEnabled) {
        updateTitle(++unreadMessagesCount);
    }
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

function processTextInput(event) {
    if (event.keyCode == 13 && !event.shiftKey) { // enter
        event.preventDefault();
        socket.emit('chat__message', msgField.val());
        msgField.val('');
    }
}

function onReloadPageClicked(e) {
    e.preventDefault();
    document.cookie = versions.authCookieName + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.reload();
}

function showPreloader() {
    $('.loader_overlay').show();
}

function hidePreloader() {
    $('.loader_overlay').hide();
}

$(function() {
    cleanLocation();

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

    socket.on('disconnect', showPreloader);
    socket.on('reconnect', function() {
        socket.emit('ping');
    });
    socket.on('pong', hidePreloader);

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

    $('.reload_page').on('click', onReloadPageClicked);

    msgTemplate = hb.compile($('#message-tpl').html());
});