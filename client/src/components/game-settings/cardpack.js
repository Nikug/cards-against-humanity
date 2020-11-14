import React from 'react';

import Icon from './../icon';
import '../../styles/cardpack.scss';
import '../../styles/gamesettings.scss';

export function CardPack({id, name, isNSFW, whiteCards, blackCards, removeCardpack}) {
    console.log({name, isNSFW, whiteCards, blackCards});
    return (
        <div className="cardpack-container">
            <div className="setting cardpack">
                <div className="cardpack-info-row">
                    <div className="label-and-value-wrapper">
                        <span className="label-and-value underline">
                            <span>
                                {name}
                            </span>
                        </span>
                    </div>
                    <div className="label-and-value-wrapper divider">
                        <span className="label-and-value underline">
                            <span>
                                {whiteCards} valkoista korttia
                            </span>
                        </span>
                    </div>
                </div>
                
                <div className="cardpack-info-row lower-row">
                    <div className="label-and-value-wrapper">
                        <span className="label-and-value">
                            <span>
                                {isNSFW ? 'NSFW' : 'not NSFW'}
                            </span>
                        </span>
                    </div>
                    <div className="label-and-value-wrapper divider">
                        <span className="label-and-value">
                            <span>
                                {blackCards} mustaa korttia
                            </span>
                        </span>
                    </div>
                </div>
                
                
            </div>
            <div className="remove" onClick={() => removeCardpack(id)}>
                <Icon name="delete_outline" className="md-36"/>
            </div>
        </div>
    )
}
