require('odata-server');
var uuid = require('node-uuid');

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
    
    // initialize passportjs
    var passport = require('passport');
    var DigestStrategy = require('passport-http').DigestStrategy; 
    app.use(passport.initialize());
    
    var model = config.model;
//    ModelContext = new model.context({name: model.name, databaseName: model.databaseName, address: model.host, port: model.port });
    var monk = require('monk');
    var db = monk(model.host + ':' + model.port + '/' + model.databaseName);
    
    // set up passport digest
    passport.use(new DigestStrategy({ qop: 'auth' },
        function(username, done) {
          // Find the user by username.  If there is no user with the given username
          // set the user to `false` to indicate failure.  Otherwise, return the
          // user and user's password.
           db.get('Member').findOne({ MemberLoginId: username}, function (err, result){
               if (err) {
                   return done(err);
               }
               if (result) {
                   return done(null, result, result.MemberPassword);
               }
               else {
                   return done(null, false);
               }
           });
        },
        function(params, done) {
          // asynchronous validation, for effect...
          process.nextTick(function () {
            // check nonces in params here, if desired
            return done(null, true);
          });
        }
      ));
      
    // curl -v -I --user user1:password --digest http://localhost:9999/digestAuth
    app.get('/digestAuth',  passport.authenticate('digest', { session: false }), function(req, res){
        res.json({username: req.user.MemberLoginId}); console.log(req.user.MemberLoginId);
        res.end();
    });
    // curl -v -I --user user1:password --digest http://localhost:9999/getListProperty
    app.get('/getListProperty', passport.authenticate('digest', { session: false }), function(req, res){
        db.get('Res').find({}, {limit:1}, function(err, results){
            if (err) {
                res.json({message: err});
                res.end();
            }
            else {
                if (results.length) {
                    console.log(results[0].ListingId);
                    res.json({count: 1});
                    res.end();
                }
                else {
                    res.json({message: "Empty"});
                    res.end();
                }
            }
        });
    });
   

};
