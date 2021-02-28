import React from "react";

import {
    CONTROL_TYPES,
    Setting,
} from "../../../../components/settings/setting";

import { ICON_CLASSNAMES } from "../../Game";

const NAME_CHAR_LIMIT = 50;

export const NamePicker = ({ setPlayerName }) => {
    return (
        <div className="nickname-selector">
            <Setting
                text={"Nimimerkki"}
                placeholderText={"nimimerkki"}
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
