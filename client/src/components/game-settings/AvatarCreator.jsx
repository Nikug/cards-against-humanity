import React from 'react';
import { useTranslation } from 'react-i18next';
import { translateUnderWork } from '../../helpers/translation-helpers';
import Icon from '../general/Icon';
import { AvatarPicker } from './AvatarPicker';

export const AvatarCreator = () => {
    const { t } = useTranslation();
    const currentAvatar = 0;
    const isDisabled = false;
    const iconClassnames = 'icon-margin-right';


    const avatarChoices = {
        heads : ["https://m.media-amazon.com/images/I/71Jy2kGzpxS._AC_UL1500_.jpg",
                    "https://previews.123rf.com/images/polkan/polkan1111/polkan111100017/11246127-illustration-of-a-santa-head.jpg"],
        torsos : ["https://previews.123rf.com/images/wernerimages/wernerimages1504/wernerimages150400098/39044962-smooth-muscular-male-torso.jpg",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTgGv2vNTDmTipiGqNn03CoiG2_u1Ua32OJw&usqp=CAU"],
        legs : ["https://static.independent.co.uk/s3fs-public/thumbnails/image/2012/11/03/21/10-shapelylegs.jpg?width=1200", 
                    "https://npr.brightspotcdn.com/dims4/default/c86f8e4/2147483647/strip/true/crop/5520x3684+0+0/resize/880x587!/quality/90/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Flegacy%2Fsites%2Fwuwm%2Ffiles%2F201911%2FAdobeStock_245471467.jpeg"],
    }

    return( 
        <div className="avatar-creator-container">
            <div className="text">
                {translateUnderWork('avatarCreator', t)}
            </div>
            
            <div className="avatar-picker-1"> 
                <AvatarPicker choices={avatarChoices.heads}/>
            </div>
            <div className="avatar-picker-2"> 
                <AvatarPicker choices={avatarChoices.torsos}/>
            </div>
            <div className="avatar-picker-3"> 
                <AvatarPicker choices={avatarChoices.legs}/>
            </div>
        </div>);
};
