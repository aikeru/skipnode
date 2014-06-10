/**
 * Created by Michael on 4/27/2014.
 */
function Card(value, color) {
    this.value = value;
    this.color = color;
    this.toString = function() {
        if(this.value === skipValue) {
            return "skip node";
        } else {
            return this.color + " " + this.value;
        }
    };
}

module.exports = Card;