
'use client';
import React, { useState, useEffect } from 'react';

const DateWidget = ({ color }) => {
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

  return <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: color || '#ffffff'}}>{formatDate(date)}</div>;
};

export default DateWidget;
