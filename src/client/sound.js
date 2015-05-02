/**
 * Notifications through Audio API
 */
var sound;
var $ = require('jquery');
var settings = require('./settings');

$(function() {
    sound = document.getElementById('chat_messageSound');
    $('#chat_messageSound').attr('src', 'message.mp3');
});

module.exports = {
    play: function() {
        if (settings.get('notifications.sound') == 'off') return;
        sound.play();
    }
};
