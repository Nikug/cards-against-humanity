export const mergeWhiteCardsByplayer = (whiteCardsByPlayer) => {
    const mergedCards = [];
    const wonCards = [];

    for (let i = 0, len = whiteCardsByPlayer.length; i < len; i++) {
        const whiteCards = whiteCardsByPlayer[i].whiteCards;
        const newWhiteCard = {
            id: [],
            cardPackID: [],
            text: [],
            isOwn: whiteCardsByPlayer[i].isOwn,
        };

        for (let j = 0, len2 = whiteCards.length; j < len2; j++) {
            const whiteCard = whiteCards[j];

            newWhiteCard.id.push(whiteCard.id);
            newWhiteCard.cardPackID.push(whiteCard.cardPackID);
            newWhiteCard.text.push(whiteCard.text);
        }

        mergedCards.push(newWhiteCard);

        if (whiteCardsByPlayer[i].wonRound) {
            wonCards.push(newWhiteCard);
        }
    }

    return [mergedCards, wonCards];
};
