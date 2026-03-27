
import React from 'react';
import styles from '../uno.module.css';

const ColorPicker = ({ onSelectColor }) => {
  const colors = ['red', 'yellow', 'green', 'blue'];

  return (
    <div className={styles.colorPicker}>
      <h3>Choose a color</h3>
      <div className={styles.colorOptions}>
        {colors.map((color) => (
          <div
            key={color}
            className={`${styles.colorOption} ${styles[color]}`}
            onClick={() => onSelectColor(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
