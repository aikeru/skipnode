var selectionMode = "select";
var lastSelectedType;
$(function() { $('.jqButton').button(); });

function getEffectiveValue($element) {
    var cardArr = [];
    if($element.parent().is('.ontable')) {
        cardArr = gameData.game.tableSlots[$element.data('index')];
    }
    if($element.data('value') === undefined) { return undefined; }
    if(isNaN(+$element.data('value'))) { return undefined; }
    if (!cardArr || !cardArr.length || cardArr.length === 0) {
        return undefined;
    }
    return cardArr[cardArr.length - 1].value === 0 ?
        cardArr.length : cardArr[cardArr.length - 1].value;
}

function initTurn() {
    $('.hand.ontable').find('.card,.emptyCard').click(function() {
        if($(this).is('.selected')) { $('.selected').removeClass('selected'); return; }
        if($('.selected').length > 1) { return; }
        if(selectionMode === 'play') {
            $('.hand.ontable .selected').removeClass('selected');
            $(this).addClass('selected');
            lastSelectedType = 'ontable';
        }
    });
    $('.hand.inplay').find('.card,.emptyCard').click(function() {
        if($(this).is('.selected')) { $('.selected').removeClass('selected'); return; }
        //if(selectionMode === 'select') {
        if(lastSelectedType === 'mine') {
            if($(this).data('index') === undefined) {
                $('.selected').removeClass('selected');
            }
            $('.hand.inplay .selected').removeClass('selected');
            $(this).addClass('selected');
        } else {
            if($(this).is('.emptyCard')) { return; };
            if($(this).data('index') === undefined) {
                //Unselect any in play
                $('.hand.inplay').find('.card,.emptyCard').removeClass('selected');
            }
            $('.card.selected').removeClass('selected');
            $(this).addClass('selected');
        }
        selectionMode = 'play';
        lastSelectedType = 'inplay';

        //}
    });
    $('.hand.mine').find('.card').click(function() {
        if($(this).is('.selected')) { $('.selected').removeClass('selected'); return; }
        //if(selectionMode === 'select') {
        $('.selected').removeClass('selected');
        $(this).addClass('selected');
        selectionMode = 'play';
        lastSelectedType = 'mine';
        //}
    });
    $('.jqButton.discardButton').click(function() {
        var selectedCard = $('.card.selected, .emptyCard.selected');
        if(selectedCard.length < 2) { alert('You must select a card and a slot.'); return; }
        if(selectedCard.closest('.hand').is('.ontable')) { alert('You cannot discard onto the table.'); return; }
        $.ajax({url: '/game/discard', data: {
            fromIndex: $('.hand.mine .card.selected').data('index'),
            toIndex: $('.hand.inplay .selected').data('index'),
            name: gameData.game.name
        }, type: 'POST'})
            .done(function(msg) {
               window.location.reload();
            })
            .error(function(){ alert('There was an error :('); });
    });
    $('.jqButton.playButton').click(function() {

        var selectedCard = $('.card.selected, .emptyCard.selected');
        if(selectedCard.length < 2) { alert('You must select a card and a slot.'); return; }

        var fromLocation,
            toLocation,
            fromIndex,
            toIndex,
            fromCard,
            fromValue,
            toValue;

        if(selectedCard.closest('.hand').is('.mine')) {
            //Play from the hand
            fromLocation = 'hand';
            fromCard = $('.mine .card.selected');
            fromValue = fromCard.data('value');
            fromIndex = fromCard.data('index');

            if(selectedCard.closest('.hand').is('.inplay')) {
                alert('You cannot play into your slots. Did you mean to discard?');
                return;
            }
            if(selectedCard.closest('.hand').is('.ontable')) {
                toLocation = 'table';
                toIndex = $('.ontable .emptyCard.selected, .ontable .card.selected').data('index');
                toValue = getEffectiveValue($('.ontable .emptyCard.selected, .ontable .card.selected'));

                //Is this a valid play?
                if(+fromValue === 0) {
                    //Can play on anything
                } else {
                    if(fromValue === 1
                        && toValue !== undefined) {
                        alert('You can only play a one (1) on an empty slot.');
                        return;
                    } else if(fromValue !== 1 && (toValue === undefined || fromValue !== toValue + 1)) {
                        alert('That is not a valid play.');
                        return;
                    }
                }

            }

            $.ajax({
                url: "/game/playfromhand",
                data: { name: gameData.game.name, toLocation: toLocation, fromIndex: fromIndex, toIndex: toIndex }, //name, toLocation, fromindex, toindex
                type: 'POST'
            })
                .done(function() {
                   window.location.reload();
                });
            return;
        } else if(selectedCard.closest('.hand').is('.inplay')) {

            fromCard = $('.inplay .selected');

            if(fromCard.data('index') === undefined) {
                //Play from remaining

                toValue = getEffectiveValue($('.ontable .emptyCard.selected, .ontable .card.selected'));
                fromValue = +fromCard.data('value');
                if(fromValue !== 0) {
                    if(fromValue === 1 && toValue !== undefined) {
                        alert('You can only play a one (1) on an empty slot.');
                        return;
                    } else if(fromValue !== toValue + 1) {
                        alert('That is not a valid play.');
                        return;
                    }
                }

                $.ajax({
                    url: '/game/playfromremaining',
                    data: { name: gameData.game.name, toIndex: $('.ontable .emptyCard.selected, .ontable .card.selected').data('index') },
                    type: 'POST'
                }).done(function() { window.location.reload(); });
            } else {
                //Play from slot

                toValue = getEffectiveValue($('.ontable .emptyCard.selected, .ontable .card.selected'));
                fromValue = +fromCard.data('value');
                if(fromValue !== 0) {
                    if(fromValue === 1 && isNaN(toValue) === false) {
                        alert('You can only play a one (1) on an empty slot.');
                        return;
                    } else if(fromValue !== toValue + 1) {
                        alert('That is not a valid play.');
                        return;
                    }
                }

                $.ajax({
                    url: '/game/playfromslot',
                    data: { name: gameData.game.name,
                        toIndex: $('.ontable .emptyCard.selected, .ontable .card.selected').data('index'),
                    fromIndex: fromCard.data('index') },
                    type: 'POST'
                }).done(function() { window.location.reload(); });
            }
        }
    });
}

$(function() {
    if(gameData.ourTurn) { initTurn(); }
    else {
        function checkLoop() {
            $.ajax({ url: '/game/dashboard?gameName=' + gameData.game.name + '&userName=' + gameData.player.userName })
                .done(function(msg) {
                    console.log('Is it our turn yet? ' + msg.ourTurn);
                    if(!msg.ourTurn) {
                        window.setTimeout(checkLoop, 2000);
                    } else {
                        window.location.reload();
                    }
                });
        }
        window.setTimeout(checkLoop, 2000);
    }
});