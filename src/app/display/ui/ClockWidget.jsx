
'use client';
import React, { useState, useEffect } from 'react';

const ClockWidget = ({ color, fontSize }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const fontSizes = {
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px',
    5: '40px',
    6: '48px',
    7: '56px',
  };

  return <div style={{fontSize: fontSizes[fontSize] || '16px', fontWeight: 'bold', color: color || '#ffffff'}}>{formatTime(time)}</div>;
};

export default ClockWidget;
