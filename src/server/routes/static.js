var _ = require('lodash');
var path = require('path');

module.exports = function(app) {
    // Custom paths
    var servedFiles = {
        '/failedToEnter/': 'static/failed.html',
        '/bundle.js': 'bundle.js'
    };

    _.each(servedFiles, function(value, key) {
        app.get(key, function(req, res) {
            res.sendFile(path.resolve(__dirname + '/../../../build/' + value));
        });
    });

    // Common static
    app.get('/static*', function(req, res) {
        res.sendFile(path.resolve(__dirname + '/../../../build' + req.url));
    });
};
