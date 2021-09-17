import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateUnderWork } from '../../helpers/translation-helpers';
import Icon from '../general/Icon';

const defaultAvatar = {
    hatType: 0,
    eyeType: 0,
    mouthType: 0
};

const maxAvatarTypes = {
    hatType: 5,
    eyeType: 5,
    mouthType: 5, 
}

const avatarImg = "https://cdn.shopify.com/s/files/1/0220/9497/0980/products/image_e0191ed4-1fcc-4e99-a811-0624189386bc.png?v=1558095871";

export const AvatarCreator = () => {
    const { t } = useTranslation();
    const [currentAvatar, setCurrentAvatar] = useState(defaultAvatar);

    const changeAvatar = (type, dir) => {
        let newAvatar = { ...currentAvatar }
        if (dir === "next") {
            newAvatar[type] = Math.min(newAvatar[type] + 1, maxAvatarTypes[type]);
            setCurrentAvatar(newAvatar);
            console.log("Set avatar");
        } else if ( dir === "prev") {
            newAvatar[type] = Math.max(newAvatar[type] - 1, 0);
            setCurrentAvatar(newAvatar);
            console.log("Set avatar");
        } else {
            return;
        }
    };

    return( 
        <div className="avatar-creator-container">
            <div className="text">
                {translateUnderWork('avatarCreator', t)}
            </div>
            
            <span className="hat-text">Hat: {currentAvatar.hatType} </span>
            <div className="arrow-left-1">
                <Icon name="arrow_back_ios" className="" onClick={() => changeAvatar("hatType", "prev")} />   
            </div>
            <span className="eyes-text">Eyes: {currentAvatar.eyeType}</span>
            <div className="arrow-left-2">
                <Icon name="arrow_back_ios" className="" onClick={() => changeAvatar("eyeType", "prev")} />   
            </div>
            <span className="mouth-text">Mouth: {currentAvatar.mouthType}</span>
            <div className="arrow-left-3">
                <Icon name="arrow_back_ios" className="" onClick={() => changeAvatar("mouthType", "prev")} />   
            </div>
            <div className="avatar">
                <img src={avatarImg}/>
            </div>
            <div className="arrow-right-1">
                <Icon name="arrow_forward_ios" className="" onClick={() => changeAvatar("hatType", "next")} />   
            </div>
            <div className="arrow-right-2">
                <Icon name="arrow_forward_ios" className="" onClick={() => changeAvatar("eyeType", "next")} />   
            </div>
            <div className="arrow-right-3">
                <Icon name="arrow_forward_ios" className="" onClick={() => changeAvatar("mouthType", "next")} />   
            </div>   
        </div>);
};
