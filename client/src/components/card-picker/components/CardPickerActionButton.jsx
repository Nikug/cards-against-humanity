import React, { forwardRef } from 'react';
import { Button } from '../../general/Button.tsx';

export const CardPickerActionButton = forwardRef((props, ref) => {
    return <Button ref={ref} {...{ ...props, additionalClassname: props.additionalClassname + ' action-button' }} />;
});
