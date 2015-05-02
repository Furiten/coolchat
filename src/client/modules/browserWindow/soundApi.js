/**
 * Notifications through Audio API
 */

var _ = require('lodash');

module.exports = function(eventBus, registry) {
    var sound,
        pageActive = true;

    eventBus.on('client__pageLoaded', initSound);
    eventBus.on('chat__message', playSound);
    eventBus.on('client__windowBlurred', function() {
        pageActive = false;
    });
    eventBus.on('client__windowFocused', function() {
        pageActive = true;
    });

    function initSound() {
        sound = document.createElement('audio');
        sound.src = 'message.mp3';
        document.body.appendChild(sound);
    }

    function playSound() {
        var soundSetting = registry.get('notifications.sound');
        if (soundSetting == 'off') return;
        if (soundSetting == 'inactive_page' && pageActive) return;
        sound.play();
    }
};
