
import React from 'react';
import styles from '../uno.module.css';
import { FaPlus, FaPlusCircle, FaSync, FaBan, FaGlobe } from 'react-icons/fa';

const Card = ({ card, handleCardClick }) => {
  const handleClick = () => {
    if (handleCardClick) {
      handleCardClick(card);
    }
  };

  return (
    <div
      className={`${styles.card} ${styles[card.color.toLowerCase()]}`}
      onClick={handleClick}
    >
      <span className={styles.cardValue}>
        {card.value === 'draw-two' && <FaPlusCircle />}
        {card.value === 'draw-two' && <span>2</span>}
        {card.value === 'wild-draw-four' && <FaPlus />}
        {card.value === 'wild-draw-four' && <span>4</span>}
        {card.value === 'reverse' && <FaSync />}
        {card.value === 'skip' && <FaBan />}
        {card.value === 'wild' && <FaGlobe />}
        {card.value !== 'draw-two' &&
          card.value !== 'wild-draw-four' &&
          card.value !== 'reverse' &&
          card.value !== 'skip' &&
          card.value !== 'wild' &&
          card.value}
      </span>
    </div>
  );
};

export default Card;
