var _ = require('lodash');
var html = require('../../common/html');
var messageVm = require('./messageViewModel');

module.exports = function(eventBus, registry) {
    var msgTemplate = require('../templates/message.hbs'),
        chatField;
    eventBus.on('client__pageLoaded', function() {
        chatField = $('.field_chat');
    });

    eventBus.on('chat__userCame', userLoggedIn);
    eventBus.on('chat__userDisconnected', userWentAway);
    eventBus.on('chat__message', userMessage);
    eventBus.on('chat__previousMessages', showPrevMessages);
    eventBus.on('chat__userlistAppeared', function() {
        chatField.addClass('compact');
    });
    eventBus.on('chat__userlistDisappeared', function() {
        chatField.removeClass('compact');
    });

    eventBus.on('client__windowBlurred', function() {
        chatField.find('.chat_message').css('border-bottom', '0px');
        chatField.find('.chat_message').last().css('border-bottom', '1px solid #333');
    });

    function showMessage(msg) {
        chatField.append(msgTemplate(messageVm(msg)));
        window.scrollTo(0, document.body.scrollHeight + 100);
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
};
