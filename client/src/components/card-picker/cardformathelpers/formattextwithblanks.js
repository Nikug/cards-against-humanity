import React from 'react';

export const formatTextWithBlanksAsDiv = (text, blankTexts) => {
    const splittedText = text.split('_');
    const piecesToRender = [];

    for (let i = 0, blankIterator = 0, len = splittedText.length; i < len; i++) {
        const piece = splittedText[i];
        piecesToRender.push(
            <span key={`t-${i}`} className="text">
                {piece}
            </span>
        );
        if (i === len - 1) {
            break;
        }
        if (blankTexts && blankTexts[blankIterator]) {
            piecesToRender.push(
                <span key={`b-${i}`} className="blank">
                    {blankTexts[blankIterator]}
                </span>
            );
            blankIterator++;
        } else {
            piecesToRender.push(
                <span key={`b-${i}`} className="blank">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
            );
        }
    }

    return <div className="text">{piecesToRender}</div>;
};

export const formatTextWithBlanksAsText = (text, blankTexts) => {
    const splittedText = text.split('_');
    let fullText = '';

    for (let i = 0, blankIterator = 0, len = splittedText.length; i < len; i++) {
        const piece = splittedText[i];
        fullText = fullText + piece;

        if (i === len - 1) {
            break;
        }
        if (blankTexts && blankTexts[blankIterator]) {
            fullText = fullText + blankTexts[blankIterator];
            blankIterator++;
        }
    }

    return fullText;
};
