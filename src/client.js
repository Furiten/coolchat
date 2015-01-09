/**
 * Client-side entry point
 */

var _ = require('lodash');
var $ = require('jquery');
var dateFormat = require('./common/dateformat');
var io = require('socket.io-client');

var socket, button, msgField, chatField;

function login() {
    socket.emit('chat__nickname', 'heilage');
}

function userLoggedIn(data) {
    var content = dateFormat.format(new Date()) + ' К нам приходит ' + data.nickname + '!';
    chatField.append("<div class='message'>" + content + "</div>");
}

function userMessage(data) {
    var content = dateFormat.format(new Date()) + ' <b>' + data.nickname + '</b>: ' + data.message;
    chatField.append("<div class='message'>" + content + "</div>");
}

function userWentAway(data) {
    var content = dateFormat.format(new Date()) + ' От нас уходит ' + data.nickname + '.';
    chatField.append("<div class='message'>" + content + "</div>");
}

function showPrevMessages(messagesList) {
    messagesList.reverse();
    _.each(messagesList, function(msg) {
        var content;
        var date = new Date(msg.date);
        switch(msg.event) {
            case 'chat__message':
                content = dateFormat.format(date) + ' <b>' + msg.nickname + '</b>: ' + msg.message;
                break;
            case 'chat__userDisconnected':
                content = dateFormat.format(date) + ' От нас уходит ' + msg.nickname + '.';
                break;
            case 'chat__userCame':
                content = dateFormat.format(date) + ' К нам приходит ' + msg.nickname + '!';
                break;
            default:
                return;
        }

        chatField.prepend("<div class='message'>" + content + "</div>");
    })
}

$(function() {
    socket = io();
    button = $('.button_submit');
    msgField = $('.field_message');
    chatField = $('.field_chat');

    login();
    button.on('click', function() {
        socket.emit('chat__message', msgField.val());
    });

    socket.io.on('reconnect', login);
    socket.on('chat__userCame', userLoggedIn);
    socket.on('chat__message', userMessage);
    socket.on('chat__userDisconnected', userWentAway);
    socket.on('chat__previousMessages', showPrevMessages);
});