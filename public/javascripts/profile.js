/**
 * Created by Michael on 6/10/2014.
 */
$(function() {
    $('#btnStartNewGame').click(function() {
        var displayName = prompt('What name shall I call you during this game?');
        var gameName = prompt('What is this game to be called?');
        $.ajax({
            type: 'POST',
            url: '/games',
            data: { name: gameName }
        })
            .done(function() {
                $.ajax({
                    type: 'POST',
                    url: '/game/addplayer',
                    data: { name: gameName, userName: gameData.userName, displayName: displayName }
                }).done(function() {
                    window.location.href = '/dashboard?gameName=' + encodeURIComponent(gameName);
                })
            })
    });
});