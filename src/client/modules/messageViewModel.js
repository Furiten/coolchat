var dateFormat = require('../../common/dateformat');
var html = require('../../common/html');

var lastMessageSource = null;

function msgPrefilters(msg) {
    msg = html.nl2br(msg);
//    msg = emoji.unifiedToHTML(msg); // TODO: emoji in textarea, see client/emojiarea.js
    return msg;
}

module.exports = function(msg) {
    var currentMessageSource = (msg.type == 'userMessage' ? msg.username : 'robot');
    var appendToPrevious = (currentMessageSource == lastMessageSource);
    lastMessageSource = currentMessageSource;

    if (msg.type == 'userMessage') { // обычное юзерское сообщение
        return {
            appendToPrevious: appendToPrevious,
            dateTime: dateFormat.pattern(msg.date, 'Y-m-d @ H:i:s'),
            username: msg.username,
            avatar: msg.avatar || '/static/avatars/someone.jpg',
            content: msg.content ? msgPrefilters(msg.content) : null
        };
    }

    // Если дошли сюда, значит говорит бот
    var messages = {
        'userCame': "К нам приходит %1",
        'userWentAway': "От нас уходит %1"
    };

    return {
        appendToPrevious: appendToPrevious,
        dateTime: dateFormat.pattern(msg.date, 'Y-m-d @ H:i:s'),
        username: "Infobot",
        avatar: '/static/avatars/robot.jpg',
        content: (messages[msg.type] || '').replace('%1', msg.username)
    };
};
