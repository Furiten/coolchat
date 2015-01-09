var _ = require('lodash');
var dateFormat = require('../common/dateformat.js');

module.exports = function(msg) {
    console.log(dateFormat.format(new Date()) + ' ' + msg);
};