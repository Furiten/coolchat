var _ = require('lodash');
var eventBus = require('../../../common/eventBus');
var storage = window.localStorage || null;

function attachEvent(cb) {
    if ('v'=='\v') { // Note: IE listens on document
        document.attachEvent('onstorage', cb, false);
    } else if (window.opera || window.chrome || window.safari) { // Note: Opera and WebKits listens on window
        window.addEventListener('storage', cb, false);
    } else { // Note: FF listens on document.body or document
        document.body.addEventListener('storage', cb, false);
    }
}

module.exports = {
    status: function(masterCallback, slaveCallback) {
        if (!storage) return;
        var isMaster = true;

        // Add event for case it is not master: will receive sign from storage
        attachEvent(function onStorage(e) {
            if (e.key == '___master?' && isMaster) {
                storage.setItem('___master!', '0');
                storage.removeItem('___master!');
            }

            if (e.key == '___master!') {
                slaveCallback();
                isMaster = false;
            }

            // No auxiliary key? Then it's a message!
            if (!isMaster) {
                // TODO: Master window should behave as a proxy. Slave window should not establish any connections
                
                // TODO: Подумать как обработать seamless-переподключение, если мастер-окно закрывается.
            }
        });

        // Add small timeout for when there is no repliers
        setTimeout(function() {
            if (isMaster) {
                masterCallback();
            }
        }, 300);

        // And finally trigger event
        storage.removeItem('___master?');
        storage.setItem('___master?', '0');
    }
};
