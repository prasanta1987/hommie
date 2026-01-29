import React from 'react';

const SliderUI = ({ value, rangeMin, rangeMax, onChange, onMouseUp, onTouchEnd }) => {
    return (
        <div className='w-100'>
            <div className="feed-value">{value}</div>
            <div className="d-flex w-100 justify-content-between align-items-center">
                <span>{rangeMin}</span>
                <input
                    type="range"
                    min={rangeMin}
                    max={rangeMax}
                    value={value}
                    className="feed-slider"
                    onChange={(e) => onChange(e.target.value)}
                    onMouseUp={(e) => onMouseUp(e.target.value)}
                    onTouchEnd={(e) => onTouchEnd(e.target.value)}
                />
                <span>{rangeMax}</span>
            </div>
        </div>
    );
};


export default SliderUI;
