"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffleCardsBackToDeck = exports.shuffleCards = void 0;
const mathUtil_1 = require("../utilities/mathUtil");
function shuffleCards(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
}
exports.shuffleCards = shuffleCards;
function shuffleCardsBackToDeck(cards, deck) {
    let newCards = [...deck];
    for (const card in cards) {
        newCards.splice(mathUtil_1.randomBetween(0, newCards.length), 0, cards[card]);
    }
    return [...newCards];
}
exports.shuffleCardsBackToDeck = shuffleCardsBackToDeck;
