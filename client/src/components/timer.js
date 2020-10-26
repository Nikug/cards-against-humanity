import React from 'react';

import './../styles/timer.scss';

export function Timer({width, percent}) {
    const [value, setValue] = React.useState(0);

    React.useEffect(() => {
        setValue(percent * width);
    });

    return (
        <div>
            <div className="progress-div" style={{ width: `${width}%` }}>
                <div style={{ width: `${value}%` }} className="progress" />
            </div>
        </div>
    );
};
