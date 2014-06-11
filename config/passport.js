// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var userApi = require('../api/user');
// load up the user model
//var User       		= require('../app/models/user');
var database = require('../api/database').getDatabase();


// expose this function to our app using module.exports
module.exports = function (passport) {

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        userApi.findById({_id:id}).then(function (user) {
            done(null, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, email, password, done) {

            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function () {

                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                //User.findOne({ 'local.email' :  email }, function(err, user) {
                userApi.findOne({ 'local.email': email }).then(function (user) {
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        return userApi.generateHash(password)
                            .then(function (hashedPassword) {
                                var newUser = {
                                    local: {
                                        email: email,
                                        password: hashedPassword
                                    }
                                };
                                return userApi.createUser(newUser)
                                    .then(function () {
                                        return done(null, newUser);
                                    });
                            });

                    }
                });


            });

        }));
    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            userApi.findOne({ 'local.email': email }).then(function (user) {
                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                }
                userApi.validPassword(password, user)
                    .then(function (isValid) {
                        if(!isValid) { return done(null,false, req.flash('loginMessage', 'Oops! Wrong password.')); }
                        return done(null, user);
                    });
            });
        }));
    console.log('Passport configuration completed');
};
