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

router.post('/discard', function(req, res) {
   game.discard(req.body.name, req.body.fromIndex, req.body.toIndex)
       .then(function() {
          res.json(true);
       });
});
router.post('/addplayer', function(req, res) {
    game.addPlayer(req.body.name, req.body.userName, req.body.displayName)
        .then(function() {
           res.json(true);
        });
});
router.post('/startgame',function(req, res) {
    game.startGame(req.body.name)
        .then(function() {
            res.json(true);
        });
});
router.post('/playfromslot',function(req, res) {
    game.playFromSlot(req.body.name, req.body.fromIndex, req.body.toIndex)
        .then(function() {
            res.json(true);
        });
});
router.post('/playfromhand', function(req, res) {
    game.playFromHand(req.body.name, req.body.fromIndex, req.body.toLocation, req.body.toIndex)
        .then(function() {
            res.json(true);
        });

});
router.post('/playfromremaining', function(req, res) {
    game.playFromRemaining(req.body.name, req.body.toIndex)
        .then(function() {
            res.json(true);
        });

});
router.get('/dashboard', function(req, res) {
    game.findGame(req.query.gameName)
        .then(function(game) {

            var player,
                ourTurn = false,
                currentPlayerName = '';
            for(var i = 0; i < game.players.length; i++){
                if(game.players[i].userName === req.query.userName) {
                    player = game.players[i];
                    if(i === game.currentPlayerIndex) { ourTurn = true; }
                }
                if(i === game.currentPlayerIndex) {
                    currentPlayerName = game.players[i].displayName;
                }
            }

            res.json({
                game: game,
                player: player,
                ourTurn: ourTurn,
                currentPlayerName: currentPlayerName
            });
        });
});

module.exports = function(app, passport) {
    return router;
};