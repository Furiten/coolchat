var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

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
module.exports = EventBus;
