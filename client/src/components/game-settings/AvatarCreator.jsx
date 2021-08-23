import React from "react";
import { useTranslation } from "react-i18next";
import { translateUnderWork } from "../../helpers/translation-helpers";

import { CONTROL_TYPES, Setting } from './../settings/setting';
import { translateCommon } from '../../helpers/translation-helpers';

export const AvatarCreator = ({setPlayerAvatar}) => {
    const { t } = useTranslation();
    const currentAvatar = 0;
    const isDisabled = false;
    const iconClassnames = 'icon-margin-right';

    return (
        <div className="avatar-creator-container">
            {/*translateUnderWork("avatarCreator", t)*/}
            <Setting
                commented-text={translateCommon('avatarCreator', t)}
                text="Avatar"
                controlType={[CONTROL_TYPES.number]}
                onChangeCallback={setPlayerAvatar}
                currentValue={[currentAvatar]}
                isDisabled={isDisabled}
                icon={{
                    name: 'groups',
                    className: iconClassnames,
                    isDisabled: isDisabled,
                }}
            />
        </div>
    );
};
