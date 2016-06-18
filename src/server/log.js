var _ = require('lodash');
var dateFormat = require('../common/dateformat.js');

module.exports = function(logger) {
    return function(msg) {
        logger.varlog.info(dateFormat.format(new Date()) + ' ' + msg);
    };
};
