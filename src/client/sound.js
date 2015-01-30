var sound;
var $ = require('jquery');

$(function() {
    sound = document.getElementById('chat_messageSound');
    $('#chat_messageSound').attr('src', 'message.mp3');
});

module.exports = {
    play: function() {
        sound.play();
    }
};
