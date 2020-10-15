import React from "react";

import styles from "./card.module.scss";

export const Card = (props) => {
    const onSelect = () => {
        if (!!props.selectBlackCard) {
            props.selectBlackCard(props.card.id);
        }
    };

    return (
        <div className={styles.card} onClick={() => onSelect()}>
            <div className={styles.innerCard}>
                <div
                    className={
                        props.type === "black" ? styles.black : styles.white
                    }
                >
                    <div className={styles.text}>
                        <p>{props.card.text}</p>
                    </div>
                    <div className={styles.footer}>
                        {props.type === "black" && (
                            <p>{`Pelaa: ${props.card.whiteCardsToPlay}, nosta: ${props.card.whiteCardsToDraw}`}</p>
                        )}
                        <p>{props.card.cardPackID}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
