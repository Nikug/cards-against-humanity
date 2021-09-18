import React from 'react';

export const AvatarImage = ({ imagesrc, hatImagesrc, eyeImagesrc, mouthImagesrc }) => {
    return (
        <div className="avatar-img-container">
            <img className="bgr-img" src={imagesrc} />
            {hatImagesrc !== '' && <img className="hat-img" src={hatImagesrc} />}
            {eyeImagesrc !== '' && <img className="eye-img" src={eyeImagesrc} />}
            {mouthImagesrc !== '' && <img className="mouth-img" src={mouthImagesrc} />}
        </div>
    );
};
