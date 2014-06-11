
var db = require('./database').getDatabase(),
    users = db.collection('users'),
    games = db.collection('games'),
    bcrypt = require('bcrypt-nodejs'),
    ObjectID = require('mongodb').ObjectID;

var util = require('./util'),
    Promise = require('bluebird'),
    getRandom = util.getRandom;
Promise.promisifyAll(require('bcrypt-nodejs'));

var instance = {
    createUser: function(newUser) {
        return users.insertAsync(newUser, {w:1});
    },
    generateHash: function(password) {
        return bcrypt.genSaltAsync(8)
            .then(function(salt) {
                return bcrypt.hashAsync(password, salt,
                    function progress() {
                        console.log('progress hashing ...');
                    })
                    .then(function(hashedPassword) {
                        return hashedPassword;
                    })
                    .catch(function(err) {
                        throw err;
                    });
            });
    },
    validPassword: function(password, user) {
        return bcrypt.compareAsync(password, user.local.password);
    },
    findById: function(id) {
        var idStr = id && id._id ? id._id : ''+id;
        var idx = new ObjectID(idStr);

        return users.findOneAsync({_id: idx});
    },
    findOne: function(opts) {
        return users.findOneAsync(opts);
    }
};

module.exports = instance;