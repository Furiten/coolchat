var _ = require('lodash');

module.exports = function(eventBus, registry) {
    var SETTINGS_KEY = 'chat_settings',
        modal,
        popupNotificationsSelect = '#settings-page .popup-notifications',
        titleNotificationsSelect = '#settings-page .title-notifications',
        soundNotificationsSelect = '#settings-page .sound-notifications',
        displayNameInput = '#settings-page .display-name';

    registry.loadFromStorage(SETTINGS_KEY);

    eventBus.on('client__pageLoaded', initModule);
    eventBus.on('chat__settingsButtonClicked', function() {
        modal.modal('show');
    });

    function initModule() {
        modal = $('#settings-page').modal({
            onDeny: fromRegistryToForm,
            onApprove: fromFormToRegistry,
            onShow: fromRegistryToForm
        });

        $('#settings-page select.dropdown').dropdown();
    }

    function fromFormToRegistry() {
        registry.set('notifications.popup', $(popupNotificationsSelect).dropdown('get value'));
        registry.set('notifications.title', $(titleNotificationsSelect).dropdown('get value'));
        registry.set('notifications.sound', $(soundNotificationsSelect).dropdown('get value'));
        registry.set('user.displayName', $(displayNameInput).val());

        registry.saveToStorage(SETTINGS_KEY);
    }

    function fromRegistryToForm() {
        $(popupNotificationsSelect).dropdown('set selected', registry.get('notifications.popup'));
        $(titleNotificationsSelect).dropdown('set selected', registry.get('notifications.title'));
        $(soundNotificationsSelect).dropdown('set selected', registry.get('notifications.sound'));
        $(displayNameInput).val(registry.get('user.displayName'));
    }
};
