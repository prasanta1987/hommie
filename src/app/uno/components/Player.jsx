
import React from 'react';
import Card from './Card';
import styles from '../uno.module.css';

const Player = ({ player, isCurrentPlayer, handleCardClick }) => {
  return (
    <div className={`${styles.player} ${isCurrentPlayer ? styles.currentPlayer : ''}`}>
      {player.hand.map((card, index) => (
        <Card key={index} card={card} handleCardClick={handleCardClick} />
      ))}
    </div>
  );
};

export default Player;
