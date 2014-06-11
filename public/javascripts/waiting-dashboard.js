$(function() {
//waiting dashboard
    $('#btnJoinGame').click(function() {
       var displayName = prompt('What name shall I call you by for this game?');
        $.ajax({ type: "POST",
        url: '/game/addplayer',
        data: { name: gameData.game.name, userName: gameData.userName, displayName: displayName }
        })
            .done(function() {
                window.location.reload();
            });
    });
    $('#btnStartGame').click(function() {
        $.ajax({
            type: "POST",
            url: '/game/startgame',
            data: { name: gameData.game.name }
        })
            .done(function() {
               window.location.reload();
            });
    });
});