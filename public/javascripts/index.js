/**
 * Created by Michael on 6/10/2014.
 */

$(function() {

    $('.buttonCreateGame').click(function() {
       var gameName = prompt('What is this game to be called?');
        $.ajax({
            type: 'POST',
            url: '/games',
            data: { name: gameName }
        }).done(function() { alert('Game created'); })
    });

    $('.buttonAddPlayer').click(function() {
        var gameName = prompt('Which game?');
        var userName = prompt('What username?');
        var displayName = prompt('What displayname?');
        $.ajax({
            type: 'POST',
            url: '/game/addplayer',
            data: { name: gameName, userName: userName, displayName: displayName }
        }).done(function() { alert('Player added'); })
    });
    $('.buttonStartGame').click(function() {
       var gameName = prompt('Which game?');
        $.ajax({
            type: 'POST',
            url: '/game/startgame',
            data: { name: gameName }
        })
            .done(function() { alert('Game started.'); });
    });

});