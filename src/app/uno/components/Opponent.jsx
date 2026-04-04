
import React from 'react';
import styles from '../uno.module.css';

const Opponent = ({ player }) => {
  return (
    <div className={styles.opponent}>
      <div className={styles.player}>
        {player.hand.map((_, index) => (
          <div key={index} className={`${styles.card} ${styles.black}`} />
        ))}
      </div>
    </div>
  );
};

export default Opponent;
