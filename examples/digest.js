var rwa = require('reso-web-api')
  , passport = require('passport')
  , DigestStrategy = require('passport-http').DigestStrategy;

var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
    , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];

function findByUsername(username, fn) {
    console.log('findbyUsername');
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.username === username) {
            return fn(null, user);
        }
    }
    return fn(null, null);
}

// Use the DigestStrategy within Passport.
//   This strategy requires a `secret`function, which is used to look up the
//   use and the user's password known to both the client and server.  The
//   password is used to compute a hash, and authentication will fail if the
//   computed value does not match that of the request.  Also required is a
//   `validate` function, which can be used to validate nonces and other
//   authentication parameters contained in the request.
passport.use(new DigestStrategy({ qop: 'auth' },
    function(username, done) {
        // Find the user by username.  If there is no user with the given username
        // set the user to `false` to indicate failure.  Otherwise, return the
        // user and user's password.
        findByUsername(username, function(err, user) {
            console.log('findbyusername');
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            return done(null, user, user.password);
        })
    },
    function(params, done) {
        // asynchronous validation, for effect...
        process.nextTick(function () {
            // check nonces in params here, if desired
            console.log('checking nonce');
            return done(null, true);
        });
    }
));

var contextType = require('./context/data-services.js');
var context = new RESO.Context({ name: 'mongoDB', databaseName: 'foo', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });

context.onReady(function(db){
    var services = [
        {path: '/RESO/OData/DataSystems', database: 'foo', type: contextType}
    ];

    contextType.generateTestData(db, function(count) {

        console.log('DataSystems data upload successful. ', count, 'items inserted.');

        var options = {
            strategy: 'digest',
            passport: passport,
            services: services,
            port: 9999,
            host: '0.0.0.0'
        };

        rwa.createResoServer(options);

    });
});