import { set } from 'firebase/database';
import React, { useEffect } from 'react';

const ColourPickerUI = ({ value, onBlur }) => {
    const [color, setColor] = React.useState(value || '#ffffff');

    useEffect(() => {
        setColor(value);
    }, [value]);


    return (
        <div className='w-100'>
            <input
                className='colourPicker'
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                onBlur={(e) => onBlur(e.target.value)}
            />
        </div>
    );
};


export default ColourPickerUI;
