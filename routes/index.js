
var express = require('express');
var router = express.Router();

var gameFactory = require('../api/game');
var game;
var database = require('../api/database').promise.then(function(db) {
    game = gameFactory(db);
});


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
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

            res.render('player-dashboard', {
                game: game,
                player: player,
                ourTurn: ourTurn,
                currentPlayerName: currentPlayerName
            });
        });

});

module.exports = router;
