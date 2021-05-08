import React from 'react';
import { useTranslation } from 'react-i18next';
import { translateCommon } from '../../helpers/translation-helpers';
import Music from '../general/music';

export const Footer = ({ secretClick }) => {
    const { t } = useTranslation();

    return (
        <div className="main-footer">
            <span className="music-player">
                <Music />
            </span>
            <span>{`${translateCommon('version', t)}: 0.2 Beta`}</span>
            <span className="copyrights" onClick={secretClick}>
                &copy; {new Date().getFullYear()}
            </span>
        </div>
    );
};
