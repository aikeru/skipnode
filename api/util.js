/**
 * Created by Michael on 4/29/2014.
 */

//Temporary place to store utility functions


function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    getRandom: getRandom
};