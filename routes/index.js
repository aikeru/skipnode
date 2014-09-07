module.exports = function(app, passport) {
    var express = require('express');
    var router = express.Router();

    var game = require('../api/game');
    var userApi = require('../api/user');

    function isLoggedIn(req,res,next) {
        if(req.isAuthenticated()) { return next(); }
        res.redirect('/');
    }

    /* GET home page. */
    router.get('/', function(req, res) {
        res.render('index', { title: 'SkipNode' });
    });

    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    router.get('/login', function(req, res) {
        res.render('login', { message: req.flash('loginMessage') });
    });
    router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login?failed',
        failureFlash: true
    }));

	router.get('/testax', function(req, res) {
		res.render('testax', { title: 'Test ActiveX' });
	});

    router.get('/signup', function(req, res) {
        res.render('signup', { message: req.flash('signupMessage') });
    });
    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    router.get('/profile', isLoggedIn, function(req, res) {

        userApi.getUserGames(req.user.local.email)
            .then(function(games) {
                var gameData = {
                  userName: req.user.local.email
                };
                res.render('profile', { user: req.user, games: games, gameData: gameData });
            });
    });

    router.get('/dashboard', isLoggedIn, function(req, res) {
        game.findGame(req.query.gameName)
            .then(function(game) {

                var gameData = {
                  game: {
                      name: game.name
                  },
                  userName: req.user.local.email
                };

                var userName = req.user.local.email,
                    isInGame = false;

                for(var i = 0; i < game.players.length; i++) {
                    if(game.players[i].userName === userName) {
                        isInGame = true;
                    }
                }

                if(game.mode === 0) {
                    res.render('waiting-dashboard', {
                       gameData: gameData,
                        game: game,
                        isInGame: isInGame
                    });
                } else if(game.mode === 1) {
                    var player,
                        ourTurn = false,
                        currentPlayerName = '',
                        userName = req.user.local.email;
                    for(var i = 0; i < game.players.length; i++){
                        if(game.players[i].userName === userName) {
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
                } else if(game.mode === 2) {
                    var winner;
                    for(var i = 0; i < game.players.length; i++) {
                        if(game.players[i].remaining.length === 0) {
                            winner = game.players[i];
                        }
                    }
                    res.render('gameover-dashboard', {
                       game: game,
                        winner: winner
                    });
                }


            });

    });
    return router;
};
