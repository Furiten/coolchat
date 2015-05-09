var plural = require('../plural');

module.exports = function(count, form1, form2, form3) {
    switch (plural(count)) {
        case 'singular':
            return form1;
        case 'plural':
            return form2;
        case 'multiplural':
            return form3;
        default:;
    }
};
