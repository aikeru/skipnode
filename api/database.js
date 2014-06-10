/**
 * Created by Michael on 4/27/2014.
 */
var MongoClient = require('mongodb').MongoClient;
var Promise = require('bluebird');

Promise.promisifyAll(require('mongodb').Collection.prototype);
Promise.promisifyAll(require('mongodb').MongoClient);


var instance = {
    database: undefined
};
var promise = MongoClient.connectAsync('mongodb://127.0.0.1:27017/skipnode04').then(function(db) {
    instance.database = db;
    console.log('Done connecting. Is db null or undefined? ' + (db === null || db === undefined));
    return db;
});

function getDatabase() {
    console.log('getDatabase called ' + (instance.database === null || instance.database === undefined));
    return instance.database;
}

module.exports = {
    getDatabase: getDatabase,
    promise: promise
};

