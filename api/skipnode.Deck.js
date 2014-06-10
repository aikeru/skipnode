/**
 * Created by Michael on 4/27/2014.
 */

var Card = require('./skipnode.Card');

var colors = ["blue", "yellow", "red", "green"];
var cardValues = [1,2,3,4,5,6,7,8,9,10,11,12];
var numberedCards = 144;
var skipCards = 18;
var skipColor = "yellow";
var skipValue = 0;

function createDeck() {
    var deck = [],
        cardIndex,
        valueIndex = 0,
        colorIndex = 0;
    for(cardIndex = 0; cardIndex < numberedCards; cardIndex++) {

        deck.push(new Card(cardValues[valueIndex], colors[colorIndex]));

        valueIndex++;
        colorIndex++;
        if(valueIndex > cardValues.length - 1) { valueIndex = 0; }
        if(colorIndex > colors.length - 1) { colorIndex = 0; }
    }
    for(cardIndex = 0; cardIndex < skipCards; cardIndex++) {
        deck.push(new Card(skipValue, skipColor));
    }

    return deck;
}
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
Deck.prototype.shuffle = function(cards) {

    var shuffled = [];
    do {
        var index = getRandom(0, cards.length - 1);
        shuffled.push(cards[index]);
        cards.splice(index, 1);
    } while(cards.length > 0);

    cards = shuffled;
    return shuffled;
};

function Deck() {
    //this.cards = [];
    var self = this;
    this.cards = Deck.prototype.shuffle(createDeck());
    this.draw = function(cardCount) {
        //TODO: limit to cards available in the deck
        return self.cards.splice(0,cardCount);
    };
}

module.exports = Deck;