var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var REACT_TIMEOUT = 1500; // ms

function makeEventEmitter(obj, maxListeners) {
    EventEmitter.call(obj);
    obj.off = EventEmitter.prototype.removeListener;
    obj.publish = EventEmitter.prototype.emit;
    _.extend(obj, EventEmitter.prototype);
    if (typeof maxListeners !== 'undefined') {
        obj.setMaxListeners(maxListeners);
    }
    return obj;
}

var EventBus = makeEventEmitter(function() {});

EventBus.requestReaction = function(eventType, data, cb) {
    var self = this;
    function handler(reply) {
        clearTimeout(timer);
        self.off('!' + eventType, handler);
        if (_.isFunction(cb)) {
            cb.apply(null, reply);
        }
    }

    var timer = setTimeout(function() {
        self.off('!' + eventType, handler);
        console.error('Event ' + eventType + ' did not receive requested reaction in ' + REACT_TIMEOUT + 'ms');
    }, REACT_TIMEOUT);

    this.on('!' + eventType, handler);
    this.emit('?' + eventType, data);
    
    return {
        done: function() {
            clearTimeout(timer);
            self.off('!' + eventType, handler);
        }
    }
};

EventBus.handleReaction = function(eventType, dataProviderCallback) {
    var self = this;
    function handler(inputData) {
        dataProviderCallback(inputData, function() {
            self.emit('!' + eventType, arguments);
        })
    }

    this.on('?' + eventType, handler);

    return {
        done: function() {
            self.off('?' + eventType, handler);
        }
    }
};

module.exports = EventBus;
