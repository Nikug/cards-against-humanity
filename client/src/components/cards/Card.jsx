import React from "react";

import styles from "./card.module.scss";

export const Card = (props) => {
    const {type, card} = props;
    const isBlack = type === "black";

    return (
        <div className={styles.card}>
            <div className={styles.innerCard}>
                <div className={isBlack ? styles.black : styles.white}>
                    <div className={styles.text}>
                        <p>{card.text}</p>
                    </div>
                    <div className={styles.footer}>
                        {isBlack && 
                            <p>{`Pelaa: ${card.whiteCardsToPlay}, nosta: ${card.whiteCardsToDraw}`}</p>
                        }
                        <p>{card.cardPackID}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}