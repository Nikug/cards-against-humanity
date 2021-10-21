import React from 'react';
import { useTranslation } from 'react-i18next';
import { copyTextToClipboard } from '../../helpers/clipboardhelpers';
import { translateCommon } from '../../helpers/translation-helpers';
import { Button, BUTTON_TYPES } from '../general/Button.tsx';

export const CopyGameLinkButton = () => {
    const { t } = useTranslation();

    const copyGameLink = () => {
        copyTextToClipboard(window.location.href);
    };

    return <Button callback={copyGameLink} text={translateCommon('copyJoiningLink', t)} icon={'content_copy'} type={BUTTON_TYPES.PRIMARY} />;
};
