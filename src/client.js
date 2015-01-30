/**
 * Client-side entry point
 */

require('./common/handlebars-helpers');
var $ = require('jquery');
window.$ = window.jQuery = $;
var typing = require('./client/typing');
var messages = require('./client/messages');
var versions = require('./common/version-config');
var io = require('socket.io-client');
var unread = require('./client/unread-notifications');

function cleanLocation() {
    var loc = window.location.href;
    if (loc.indexOf(versions.authCookieName) != -1) {
        var newLoc = loc.replace(new RegExp('\\?' + versions.authCookieName + '=([^&]+)'), '');
        window.history.replaceState({}, undefined, newLoc);
    }
}

var socket,
    msgField,
    chatField;

function processTextInput(event) {
    if (event.keyCode == 13 && !event.shiftKey) { // enter
        event.preventDefault();
        socket.emit('chat__message', msgField.val());
        msgField.val('');
    } else {
        typing.timer(function() {
            socket.emit('chat__userTyping');
        }, function() {
            socket.emit('chat__userStoppedTyping');
        });
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

    msgField.on('keydown', processTextInput);

    socket.on('chat__userCame', messages.userLoggedIn);
    socket.on('chat__message', messages.userMessage);
    socket.on('chat__userDisconnected', messages.userWentAway);
    socket.on('chat__previousMessages', messages.showPrevMessages);
    socket.on('chat__typing', typing.add);
    socket.on('chat__stoppedTyping', typing.remove);

    socket.on('disconnect', showPreloader);
    socket.on('reconnect', function() {
        socket.emit('ping');
    });
    socket.on('pong', hidePreloader);

    msgField.trigger('focus');

    $(window).focus(function() {
        unread.disable();
    });

    $(window).blur(function() {
        unread.enable();
        chatField.find('.chat_message').css('border-bottom', '0px');
        chatField.find('.chat_message').last().css('border-bottom', '1px solid #333');
    });

    $('.reload_page').on('click', onReloadPageClicked);
});