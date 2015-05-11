/**
 * Client-side root module
 */

var $ = require('jquery');
window.$ = window.jQuery = $;
var _ = require('lodash');
var bindRemoteEvents = require('./api/remoteEvents');
var eventBus = require('../../common/eventBus');
var Registry = require('../../common/registry');
var registry = new Registry();

var childModules = [
    require('./identity'),
    require('./browserWindow'),
    require('./messageList'),
    require('./userList'),
    require('./writeBoard'),
    require('./toolButtons'),
    require('./settingsPage'),
    require('./disconnectedLoader')
];

function initModules() {
    _.each(childModules, function(module) {
        module(eventBus, registry);
    });
}

$(function() {
    $('body').append(require('../templates/chat.hbs'));
    bindRemoteEvents(); // bind common socket.io and eventBus events
    initModules();

    eventBus.publish('client__pageLoaded');
    eventBus.on('reconnect', function() {
        eventBus.publish('chat__ping');
    });

    $(window).focus(function() {
        eventBus.publish('client__windowFocused');
    });

    $(window).blur(function() {
        eventBus.publish('client__windowBlurred');
    });

    eventBus.on('chat__logoutButtonClicked', function() {
        location.href = '/logout';
    });
});