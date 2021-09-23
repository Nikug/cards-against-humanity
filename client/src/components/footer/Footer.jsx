import React from 'react';
import { useTranslation } from 'react-i18next';

import { translateCommon } from '../../helpers/translation-helpers';
import { Music } from '../general/music';
import { Tooltip } from '../popovers/Tooltip';

export const Footer = ({ secretClick }) => {
    const { t } = useTranslation();

    return (
        <div className="main-footer">
            <span className="music-player">
                <Music />
            </span>
            <Tooltip content={translateCommon('versionNotStable', t)} placement="top">
                <span className="version-tag">{`${translateCommon('version', t)}: 0.2 Beta`}</span>
            </Tooltip>
            <span className="copyrights" onClick={secretClick}>
                &copy; {new Date().getFullYear()}
            </span>
        </div>
    );
};
