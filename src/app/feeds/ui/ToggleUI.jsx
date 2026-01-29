import React from 'react';

const ToggleUI = ({ value, onChange, onMouseUp, onTouchEnd }) => {
    return (
        <div className='w-100'>
            <div className="feed-value">{value}</div>
            <div className="d-flex flex-column w-100 justify-content-between align-items-center">
                <input
                    type="checkbox"
                    checked={value}
                    className="feed-toggler"
                    onChange={(e) => onChange(e.target.checked)}
                />
                <span>{value ? 'ON' : 'OFF'}</span>
            </div>
        </div>
    );
};


export default ToggleUI;
