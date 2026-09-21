import React from 'react';

const ToggleUI = ({ value, onChange }) => {
    return (
        <label className="switch">
            <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="slider"></span>
        </label>
    );
};


export default ToggleUI;
