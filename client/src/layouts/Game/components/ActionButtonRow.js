import React from "react";
import { Button, BUTTON_TYPES } from "../../../components/button";
import { a, useSpring, useTransform } from "react-spring";
import { useMeasure } from "../../../helpers/animation-helpers";

export const ActionButtonRow = ({ buttons }) => {
    const [bind, { height: viewHeight }] = useMeasure();
    const { height, opacity, transform } = useSpring({
        from: { height: 0, opacity: 0, transform: "translate3d(20px,0,0)" },
        to: {
            height: viewHeight,
            opacity: 1,
            transform: `translate3d(${0}px,0,0)`,
        },
    });

    if (!buttons) {
        return null;
    }

    const content = [];

    for (let i = 0, len = buttons.length; i < len; i++) {
        const { icon, text, callback, type = BUTTON_TYPES.PRIMARY } = buttons[
            i
        ];

        content.push(
            <Button
                key={i}
                callback={callback}
                text={text}
                icon={icon}
                type={type}
            />
        );
    }

    return content;

    return (
        <a.div style={{ transform }} {...bind} className="action-button-row">
            {content}
        </a.div>
    );
};
