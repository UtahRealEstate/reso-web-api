require('odata-server');

var endPoints = [];
exports.addServiceEndPoint = function(name, url) {
    console.log(name);
};

exports.createResoServer = function(config) {

    var http    = require('http');
    var https   = require('https');
    var express = require('express');
    var app     = express();

    app.use(express.compress());
    app.use(express.json());
    app.use(express.urlencoded());

    var svc = null;

    // set up the services
    for (var i = 0; i < config.services.length; i++) {
        svc = config.services[i];
        console.log(svc.path);
        app.use(svc.path, $data.ODataServer(svc));
    }

    if (config.port !== undefined){
        var httpServer = http.createServer(app);
        httpServer.listen(config.port);
        console.log('http listening on ' + config.port);
    }

    if (config.sslPort !== undefined) {
        var httpsServer = https.createServer(config.credentials, app);
        httpsServer.listen(config.sslPort);
        console.log('https listening on ' + config.sslPort);
    }

};
