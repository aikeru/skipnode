/**
 * Created by Michael on 4/27/2014.
 */
var instance = {
    database: undefined
};
var fs = require('fs');

var Promise = require('bluebird'),
    promise;

if(process.env.database === 'mongo') {
    //Use real mongodb

    var MongoClient = require('mongodb').MongoClient;
    Promise.promisifyAll(require('mongodb').Collection.prototype);
    Promise.promisifyAll(require('mongodb').MongoClient);

    promise = MongoClient.connectAsync('mongodb://127.0.0.1:27017/skipnode04').then(function(db) {
        instance.database = db;
        console.log('Done connecting. Is db null or undefined? ' + (db === null || db === undefined));
        return db;
    });
} else {
    //Use tingodb
    // could make this async ...
    var def = Promise.defer();

    console.log('TingoDB mode ...');

    if(!fs.existsSync("data")){
        fs.mkdirSync("data", 0766, function(err){
            if(err){
                throw err;
            } else {
                initTingo();
            }
        });
    } else {
        initTingo();
    }

    function initTingo() {
        var Db = require('tingodb')().Db;
        var db = new Db('./data/', {});
        Promise.promisifyAll(db);
        instance.database = db;
        def.resolve(db);
    }

    promise = def.promise;

}


function getDatabase() {
    console.log('getDatabase called ' + (instance.database === null || instance.database === undefined));
    return instance.database;
}
function getObjectID() {
    if(process.env.database === 'mongo') {
        return require('mongodb').ObjectID;
    }
    return require("tingodb")({}).ObjectID;
}
function getCollection(colName) {
    if(process.env.database === 'mongo') {
        return getDatabase().collection(colName);
    }
    return Promise.promisifyAll(getDatabase().collection(colName));
}
module.exports = {
    getDatabase: getDatabase,
    getObjectID: getObjectID,
    getCollection: getCollection,
    promise: promise
};

