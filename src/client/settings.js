var SETTINGS_KEY = 'chat_settings';
var _ = require('lodash');
var $ = require('jquery');
var hb = require('handlebars');
var Registry = require('../common/registry');
var settings = new Registry();
settings.loadFromStorage(SETTINGS_KEY);

var modal,
    popupNotificationsSelect = '#settings-page .popup-notifications',
    titleNotificationsSelect = '#settings-page .title-notifications',
    soundNotificationsSelect = '#settings-page .sound-notifications',
    displayNameInput = '#settings-page .display-name';

$(function() {
    fromRegistryToForm();

    modal = $('#settings-page').modal({
        onDeny: fromRegistryToForm,
        onApprove: fromFormToRegistry
    });

    $(".settings_button").on('click', function() {
        modal.modal('show');
    });
});

function fromFormToRegistry() {
    settings.set('notifications.popup', $(popupNotificationsSelect).dropdown('get value'));
    settings.set('notifications.title', $(titleNotificationsSelect).dropdown('get value'));
    settings.set('notifications.sound', $(soundNotificationsSelect).dropdown('get value'));
    settings.set('user.displayName', $(displayNameInput).val());

    settings.saveToStorage(SETTINGS_KEY);
}

function fromRegistryToForm() {
    $(popupNotificationsSelect).dropdown('set value', settings.get('notifications.popup'));
    $(titleNotificationsSelect).dropdown('set value', settings.get('notifications.title'));
    $(soundNotificationsSelect).dropdown('set value', settings.get('notifications.sound'));
    $(displayNameInput).val(settings.get('user.displayName'));
}

module.exports = {
    get: settings.get,
    set: settings.set
};
