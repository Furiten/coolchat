module.exports = {
    'format': function(date) {
        return '[' +
            date.getFullYear() + '-' +
            ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('0' + date.getDate()).slice(-2) +
            ' - ' +
            ('0' + date.getHours()).slice(-2) + ':' +
            ('0' + date.getMinutes()).slice(-2) + ':' +
            ('0' + date.getSeconds()).slice(-2) +
            ']';
    },
    'pattern': function(date, p) {
        p = p.replace('Y', date.getFullYear());
        p = p.replace('m', ('0' + (date.getMonth() + 1)).slice(-2));
        p = p.replace('d', ('0' + date.getDate()).slice(-2));
        p = p.replace('H', ('0' + date.getHours()).slice(-2));
        p = p.replace('i', ('0' + date.getMinutes()).slice(-2));
        p = p.replace('s', ('0' + date.getSeconds()).slice(-2));
        return p;
    }
};