import React from 'react';

const ToggleUI = ({ value, onChange, onMouseUp, onTouchEnd }) => {
    return (
        <div className='toggle-switch'>
            <input
                type="checkbox"
                checked={value}
                className="feed-toggler"
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="slider"></span>
        </div>
    );
};


export default ToggleUI;
