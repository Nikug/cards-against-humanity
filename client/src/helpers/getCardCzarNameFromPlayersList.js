export const getCardCzarNameFromPlayersList = (players) => {
    if (!players || !players.length) {
        return '';
    }

    const cardCzars = players.filter((player) => player.isCardCzar === true);

    if (cardCzars.length === 0) {
        return '';
    }

    return cardCzars[0].name || '';
};
