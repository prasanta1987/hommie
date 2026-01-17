'use client';
import React, { useState, useEffect } from 'react';

const ClockWidget = ({ color }) => {
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

  return <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: color || '#ffffff'}}>{formatTime(time)}</div>;
};

export default ClockWidget;
