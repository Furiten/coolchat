var SETTINGS_KEY = 'chat_settings';
var _ = require('lodash');
var $ = require('jquery');
var hb = require('handlebars');
var Registry = require('../common/registry');
var settings = new Registry();
settings.loadFromStorage(SETTINGS_KEY);

var modal, popupNotificationsSelect, titleNotificationsSelect, soundNotificationsSelect, displayNameInput;

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
    settings.set('notifications.popup', $('#settings-page .popup-notifications').dropdown('get value'));
    settings.set('notifications.title', $('#settings-page .title-notifications').dropdown('get value'));
    settings.set('notifications.sound', $('#settings-page .sound-notifications').dropdown('get value'));
    settings.set('user.displayName', $('#settings-page .display-name').val())

    console.log(settings.data);
    settings.saveToStorage(SETTINGS_KEY);
}

function fromRegistryToForm() {
    $('#settings-page .popup-notifications').dropdown('set value', settings.get('notifications.popup'));
    $('#settings-page .title-notifications').dropdown('set value', settings.get('notifications.title'));
    $('#settings-page .sound-notifications').dropdown('set value', settings.get('notifications.sound'));
    $('#settings-page .display-name').val(settings.get('user.displayName'));
}

module.exports = {
    get: settings.get,
    set: settings.set
};
