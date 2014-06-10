
var db,
    games;
var Deck = require('./skipnode.Deck'),
    util = require('./util'),
    Promise = require('bluebird'),
    getRandom = util.getRandom;
var collection = require('mongodb').Collection;
var findGame = function(gameName) {
  return games.findOneAsync({name: gameName});
};

var instance = {
    saveGame: function(game) {
        delete game._id;
        return games.updateAsync({name: game.name}, {$set: game}, {w:1});
    },
    createGame: function(name, startRemaining) {
        var game = {
            name: name,
            startRemaining: startRemaining || 5,
            deck: new Deck().cards,
            discard: [],
            tableSlots: [
                [],[],[],[]
            ],
            mode: 0,
            currentPlayerIndex: 0
        };
        return games.ensureIndexAsync({name: 1}, {unique:true})
            .then(function() {
                return games.insertAsync(game, {w:1});
            });

    },
    addPlayer: function(gameName, userName, displayName) {
        return games.updateAsync({
            name: gameName
        }, {
            $push: {
                players: { userName: userName, displayName: displayName, remaining: [], hand: [], slots: [ [],[],[],[]  ] }
            }
        });
    },
    startGame: function(gameName) {
        return findGame(gameName)
            .then(function(game) {
                game.mode = 1;
                game.currentPlayerIndex = getRandom(0, game.players.length - 1);
                var drawCount = (game.players.length * (game.startRemaining || 5)) + 5;
                var cardsDrawn = game.deck.splice(0, drawCount);
                for(var i = 0; i < game.players.length; i++) {
                    game.players[i].remaining = cardsDrawn.splice(0, game.startRemaining || 5);
                    if (i === game.currentPlayerIndex) {
                        game.players[i].hand = cardsDrawn.splice(0, 5);
                    }
                }
                return instance.saveGame(game);
            });
    },
    findGameNames: function(opts) { //can limit by mode
        return games.findAsync(opts || null, {name: 1}).then(function(games) {
            var pGames = Promise.promisifyAll(games);
            return pGames.toArrayAsync();
        });
    },
    findGame: findGame,
    discard: function(gameName, fromIndex, toIndex) {
        return findGame(gameName)
            .then(function(game) {
                var currentPlayer = game.players[game.currentPlayerIndex];
                var card = currentPlayer.hand.splice(fromIndex, 1);
                //game.discard.push(card[0]);
                currentPlayer.slots[toIndex].push(card[0]);
                game.currentPlayerIndex++;
                if(game.currentPlayerIndex > game.players.length - 1) {
                    game.currentPlayerIndex = 0;
                }
                return instance.saveGame(game);
            })
            .then(function() {
                return instance.beginTurn(gameName);
            });
    },
    beginTurn: function(gameName) {
        return findGame(gameName)
            .then(function(game) {
                var currentPlayer = game.players[game.currentPlayerIndex];
                var drawCount = 5 - currentPlayer.hand.length;
                if(drawCount > 0) {

                    if(game.deck.length < drawCount) {
                        //Shuffle discarded cards and put them into the deck
                        game.deck = game.deck.concat(game.discard.slice(0));
                        game.discard = [];
                        game.deck = Deck.prototype.shuffle(game.deck);
                    }

                    var cards = game.deck.splice(0, drawCount);
                    currentPlayer.hand = currentPlayer.hand.concat(cards);
                }

               return instance.saveGame(game);
            });
    },
    playFromSlot: function(gameName, fromIndex, toIndex) {
        return findGame(gameName)
            .then(function(game) {
                var currentPlayer = game.players[game.currentPlayerIndex];
                var card = currentPlayer.slots[fromIndex].pop();
                game.tableSlots[toIndex].push(card);
                return instance.saveGame(game);
            })
    },
    playFromHand: function(gameName, fromIndex, toLocation, toIndex) {
        return findGame(gameName)
            .then(function(game) {
                var currentPlayer = game.players[game.currentPlayerIndex];
                var card = currentPlayer.hand.splice(fromIndex, 1)[0];
                if(toLocation === 'table') {
                    game.tableSlots[toIndex].push(card);
                    if(card.value === 12) {
                        //Discard this stack
                        game.discard = game.discard.concat(game.tableSlots[toIndex].slice(0));
                        game.tableSlots[toIndex] = [];
                    }
                } else {
                    currentPlayer.slots[toIndex].push(card);
                }
                return instance.saveGame(game);
            })
    },
    playFromRemaining: function(gameName, toIndex) {
        return findGame(gameName)
            .then(function(game) {
                var currentPlayer = game.players[game.currentPlayerIndex];
                var topRemainingCard = currentPlayer.remaining.pop();
                game.tableSlots[toIndex].push(topRemainingCard);
                return instance.saveGame(game);
            })
    }
};

module.exports = function(dbAsync) {
    db = dbAsync;
    games = db.collection('games');

    return instance;
};