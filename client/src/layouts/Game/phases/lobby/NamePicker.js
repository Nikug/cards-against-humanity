import {
    CONTROL_TYPES,
    Setting,
} from "../../../../components/settings/setting";

import React from "react";
import { translateCommon } from "../../../../helpers/translation-helpers";
import { useTranslation } from "react-i18next";

export const ICON_CLASSNAMES = "icon-margin-right";
const NAME_CHAR_LIMIT = 50;

export const NamePicker = ({ setPlayerName }) => {
    const { t } = useTranslation();

    return (
        <div className="nickname-selector">
            <Setting
                text={translateCommon("nickname", t)}
                placeholderText={translateCommon("nickname", t).toLowerCase()}
                controlType={CONTROL_TYPES.textWithConfirm}
                onChangeCallback={setPlayerName}
                icon={{
                    name: "person",
                    className: ICON_CLASSNAMES,
                }}
                charLimit={NAME_CHAR_LIMIT}
                customButtonIcon={"login"}
            />
        </div>
    );
};
