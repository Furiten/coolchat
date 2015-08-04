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

/**
 * Reactive bus request function:
 * When a reply from another part of system is required,
 * we call this, passing in some data and a callback to 
 * call when reply has come.
 *
 * The reply format is same as it is declared when 
 * calling dataProviderCallback in reaction handler.
 *
 * Also, there is a timeout, so reaction must be handled
 * quickly, or error will be generated and request will be discarded.
 *
 * The control object is returned, so when reaction should be over,
 * .done() should be called to free some resources of common event bus.
 */
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

/**
 * Reactive bus reply function:
 * When called, an event handler is bound to common
 * event bus. The handler will listen to any request
 * with provided eventType and will execute as many times,
 * as it is required.
 *
 * The control object is returned, so when reaction should be over,
 * .done() should be called to free some resources of common event bus.
 */
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
