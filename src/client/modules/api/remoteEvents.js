var _ = require('lodash');
var io = require('socket.io-client');
var eventBus = require('../../../common/eventBus');

var incomingEvents = {
    general: [ // events without prefix
        'disconnect',
        'reconnect'
    ],
    chat: [
        'currentlyOnline',
        'message',
        'pong',
        'previousMessages',
        'stoppedTyping',
        'typing',
        'userCame',
        'userDisconnected'
    ]
};

var outgoingEvents = {
    general: [ // events without prefix

    ],
    chat: [
        'outgoingMessage',
        'ping'
    ]
};

function bindIO() {
    socket = io();

    _.each(incomingEvents, function (incomingEventsGroup, eventGroupName) {
        _.each(incomingEventsGroup, function (eventName) {
            var eName = (eventGroupName == 'general' ? '' : eventGroupName + '__') + eventName;
            socket.on(eName, function (data) {
                console.info('incoming event: ' + eName, data);
                eventBus.publish(eName, data);
            });
        });
    });

    _.each(outgoingEvents, function (outgoingEventsGroup, eventGroupName) {
        _.each(outgoingEventsGroup, function (eventName) {
            var eName = (eventGroupName == 'general' ? '' : eventGroupName + '__') + eventName;
            eventBus.on(eName, function (data) {
                console.info('outgoing event: ' + eName, data);
                socket.emit(eName, data);
            });
        });
    });
}

module.exports = bindIO;