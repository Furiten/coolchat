module.exports = {
    'strip': function(msg) {
        return msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    'nl2br': function(msg) {
        return msg.replace(/\n/g, "<br>");
    }
};