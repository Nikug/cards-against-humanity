import React, { useEffect, useRef, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { useMeasure, usePrevious } from '../../helpers/animation-helpers';

import { Button } from '../general/Button';
import { useClickOutside } from '../../helpers/useClickOutside';

export const PopOverMenu = ({ content, buttonProps, noControl, isDefaultOpen = false }) => {
    const [isOpen, setOpen] = useState(isDefaultOpen);
    const previous = usePrevious(isOpen);
    const [bind, { height: viewHeight }] = useMeasure();
    const [buttonBind, { width: buttonWidth }] = useMeasure();
    const { height, opacity, transform } = useSpring({
        from: { height: 0, opacity: 0, transform: 'translate3d(20px,0,0)' },
        to: {
            height: isOpen ? viewHeight : 0,
            opacity: isOpen ? 1 : 0,
            transform: `translate3d(${isOpen ? 0 : 20}px,0,0)`,
        },
    });

    useEffect(() => {
        if (isDefaultOpen) {
            toggleMenu(true);
        } else if (isDefaultOpen === false) {
            closeMenu();
        }
    }, [isDefaultOpen]);

    const closeMenu = () => {
        setOpen(false);
    };

    const toggleMenu = (value = !isOpen) => {
        setOpen(value);
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
                width: containerWidth + 2, // I am not sure why it needs those 2 extra pixels, but it does. EDIT: 2 pixels might be buttons borders?
                height: 0,
            }}
            className={noControl ? 'no-control' : ''}
        >
            {!noControl && <Button {...buttonProps} callback={toggleMenu} ref={buttonBind.ref} />}
            <div className="menu-anchor">
                <animated.div
                    className="menu-container"
                    style={{
                        opacity,
                        height: isOpen && previous === isOpen ? 'auto' : height,
                    }}
                    ref={menuRef}
                >
                    <animated.div {...bind} children={content} style={transform} />
                </animated.div>
            </div>
        </div>
    );
};
