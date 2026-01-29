import React from 'react';

const SliderUI = ({ value, rangeMin, rangeMax, onChange, onMouseUp, onTouchEnd }) => {
    return (
        <div className='w-100'>
            <div className="feed-value mb-2">{value}</div>
                <input
                    type="range"
                    min={rangeMin}
                    max={rangeMax}
                    value={value}
                    className="input-slider"
                    onChange={(e) => onChange(e.target.value)}
                    onMouseUp={(e) => onMouseUp(e.target.value)}
                    onTouchEnd={(e) => onTouchEnd(e.target.value)}
                />
        </div>
    );
};


export default SliderUI;
