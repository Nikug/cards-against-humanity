import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../general/Icon';



export const AvatarPicker = ({choices}) => {
    const { t } = useTranslation();
    const [currentChoice, setCurrentChoice] = useState(0);

    const onPrevious = () => {
        if (currentChoice > 0 ) {
            setCurrentChoice(currentChoice -1);
        }
        
    }

    const onNext = () => {
        if (currentChoice < choices.length -1 ) {
            setCurrentChoice(currentChoice + 1);
        }
        
    }


    return(<div className="avatar-picker-container">
            <Icon name="arrow_back_ios" className="button-icon" onClick={onPrevious} />
                <img className="avatar-picker-img" src={choices[currentChoice]} />     
            <Icon name="arrow_forward_ios" className="button-icon" onClick={onNext} />
        </div>
    );
};
