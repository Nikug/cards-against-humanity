import React, { memo, useRef, useState } from "react";
import { animated, useSpring } from "react-spring";
import { useMeasure, usePrevious } from "../../helpers/animation-helpers";

import { Button } from "../button";
import { useClickOutside } from "../../helpers/useClickOutside";

export const PopOverMenu = memo(({ content, buttonProps }) => {
    const [isOpen, setOpen] = useState(false);
    const previous = usePrevious(isOpen);
    const [bind, { height: viewHeight }] = useMeasure();
    const [buttonBind, { width: buttonWidth }] = useMeasure();
    const { height, opacity, transform } = useSpring({
        from: { height: 0, opacity: 0, transform: "translate3d(20px,0,0)" },
        to: {
            height: isOpen ? viewHeight : 0,
            opacity: isOpen ? 1 : 0,
            transform: `translate3d(${isOpen ? 0 : 20}px,0,0)`,
        },
    });

    const closeMenu = () => {
        setOpen(false);
        console.log("close");
    };

    const toggleMenu = () => {
        setOpen(!isOpen);
        console.log("toggle");
    };

    const menuRef = useRef(null);
    useClickOutside(menuRef, [buttonBind.ref], closeMenu);

    let containerWidth = 0;
    if (buttonBind.ref && buttonBind.ref.current) {
        containerWidth = buttonBind.ref.current.scrollWidth;
    }

    return (
        <div
            style={{
                width: containerWidth + 2, // I am not sure why it needs those 2 extra pixels, but it does.
            }}
        >
            <Button
                {...buttonProps}
                callback={toggleMenu}
                ref={buttonBind.ref}
            />
            <div className="menu-anchor">
                <animated.div
                    className="menu-container"
                    style={{
                        opacity,
                        height: isOpen && previous === isOpen ? "auto" : height,
                    }}
                    ref={menuRef}
                >
                    <animated.div
                        {...bind}
                        children={content}
                        style={transform}
                    />
                </animated.div>
            </div>
        </div>
    );

    /*
    const [isOpen, setIsOpen] = useState(false);

    // Setting animations
    const previous = usePrevious(isOpen);
    const [bind, { width: viewWidth }] = useMeasure();
    console.log({ viewWidth });
    const { width, opacity, transform } = useSpring({
        from: { width: 0, opacity: 0, transform: "translate3d(20px,0,0)" },
        to: {
            width: isOpen ? viewWidth : 0,
            opacity: isOpen ? 1 : 0,
            transform: `translate3d(${isOpen ? 0 : 20}px,0,0)`,
        },
    });

    const closeMenu = () => {
        setIsOpen(false);
        console.log("close");
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        console.log("toggle");
    };

    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    useClickOutside(menuRef, [buttonRef], closeMenu);

    return (
        <div className="menu-button-wrapper">
            <Button {...buttonProps} callback={toggleMenu} ref={buttonRef} />
            <div className="menu-anchor">
                <animated.div
                    style={{
                        opacity,
                        width: isOpen && previous === isOpen ? "auto" : width,
                    }}
                >
                    <animated.div
                        className="menu-container"
                        style={{ transform }}
                        {...bind}
                    >
                        {content}
                    </animated.div>
                </animated.div>
            </div>
        </div>
    );
    */
});
