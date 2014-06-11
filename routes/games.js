/**
 * Created by Michael on 6/9/2014.
 */


var express = require('express');
var gameFactory = require('../api/game');
var game;
var database = require('../api/database').promise.then(function(db) {
    game = gameFactory(db);
});


var router = express.Router();

router.get('/', function(req, res) {
    game.findGameNames()
       .then(function(games) {
           res.json(games);
       });
});
router.post('/', function(req, res) {
   game.createGame(req.body.name, req.body.startRemaining)
       .then(function() {
          res.json(true);
       });
});
router.get('/:name',function(req, res) {
   game.findGame(req.params.name)
       .then(function(game) {
          res.json(game);
       });
});

module.exports = function(app, passport) {
    return router;
};