export function getBlackCardsToPick() {
    return [
        {
            id: "id1-b",
            cardPackID: "pack1",
            text:
                "_ something mildly funny something again, but _ is very long card.",
            whiteCardsToPlay: 2,
            whiteCardsToDraw: 3,
        },
        {
            id: "id2-b",
            cardPackID: "pack1",
            text: "Everything _ everything _ again.",
            whiteCardsToPlay: 2,
            whiteCardsToDraw: 2,
        },
        {
            id: "id3-b",
            cardPackID: "pack2",
            text: "Nothing _ nothing again.",
            whiteCardsToPlay: 1,
            whiteCardsToDraw: 1,
        },
    ];
}

export function getWhiteCards() {
    return [
        {
            id: "id1-w",
            cardPackID: "pack1",
            text:
                "Something funny but not too funny because the context is the key.",
        },
        {
            id: "id2-w",
            cardPackID: "pack1",
            text: "Everything",
        },
        {
            id: "id3-w",
            cardPackID: "pack2",
            text: "Nothing",
        },
    ];
}

export function getBlackCard(num = 0) {
    return getBlackCardsToPick()[num];
}

export function getWhiteCard(num = 0) {
    return getWhiteCards()[num];
}
