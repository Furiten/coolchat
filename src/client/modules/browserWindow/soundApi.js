/**
 * Notifications through Audio API
 */

var _ = require('lodash');

module.exports = function(eventBus, registry) {
    var sound,
        pageActive = true;

    //eventBus.on('client__pageLoaded', initSound);
    //eventBus.on('chat__message', playSound);
    eventBus.on('client__windowBlurred', function() {
        pageActive = false;
    });
    eventBus.on('client__windowFocused', function() {
        pageActive = true;
    });

    function initSound() {
        sound = document.createElement('audio');
        sound.src = '/static/message.mp3';
        document.body.appendChild(sound);
    }

    function playSound(message) {
        var highlighted = message.message.indexOf('@' + registry.get('identity.nickname')) != -1;
        var setting = registry.get('notifications.sound');

        // Не играем звук нотификации если:

        // свое сообщение
        if (message.id == registry.get('identity.id')) return;

        // выключено
        if (setting == 'off') return;

        // включено только для неактивных страниц, а мы на активной
        if (setting == 'inactive_page' && pageActive) return;

        // включено только при упоминании для неактивных страниц, а мы на активной
        if (setting == 'highlight_inactive_page' && (pageActive || !highlighted)) return;

        // сообщение не содержит упоминания
        if (setting == 'highlight' && !highlighted) return;


        var soundSetting = registry.get('notifications.sound');
        if (soundSetting == 'off') return;
        if (soundSetting == 'inactive_page' && pageActive) return;
        sound.play();
    }
};
