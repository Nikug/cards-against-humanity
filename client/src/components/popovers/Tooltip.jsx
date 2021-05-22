import React from 'react';
import Tippy from '@tippyjs/react';

export const Tooltip = ({ content, children, tippyProps }) => {
    return (
        <Tippy content={content} trigger={'mouseenter focus click'} duration={[100, 0]} placement="auto" role="tooltip" theme="tooltip" {...tippyProps}>
            {children}
        </Tippy>
    );
};
