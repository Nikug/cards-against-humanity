import React, { forwardRef } from 'react';
import { Button } from '../general/Button';

export const CardPickerActionButton = forwardRef((props, ref) => {
    return <Button ref={ref} {...props} additionalClassname={'action-button'} />;
});
