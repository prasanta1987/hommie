
'use client';
import React, { useState, useEffect } from 'react';

const DateWidget = ({ color, fontSize }) => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    // Update the date every minute
    const timerId = setInterval(() => {
      setDate(new Date());
    }, 60000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const formatDate = (date) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    // Using en-GB locale gives us the desired dd-mmm-yyyy parts
    let formattedDate = new Intl.DateTimeFormat('en-GB', options).format(date);
    return formattedDate.replace(/ /g, '-'); // Replace spaces with hyphens
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

  return <div style={{fontSize: fontSizes[fontSize] || '16px', fontWeight: 'bold', color: color || '#ffffff'}}>{formatDate(date)}</div>;
};

export default DateWidget;
