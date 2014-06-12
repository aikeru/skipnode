
var db = require('./database').getDatabase(),
    users = require('./database').getCollection('users'),
    games = require('./database').getCollection('games'),
    bcrypt = require('bcrypt-nodejs'),
    ObjectID = require('./database').getObjectID();

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
    },
    getUserGames: function(userName) {
        return games.findAsync({ 'players.userName': userName })
            .then(function(cursor) {
                var pGames = Promise.promisifyAll(cursor);
                return pGames.toArrayAsync();
            });
    }
};

module.exports = instance;