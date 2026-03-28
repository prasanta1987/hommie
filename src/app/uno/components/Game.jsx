
import React from 'react';
import Player from './Player';
import Opponent from './Opponent';
import Card from './Card';
import styles from '../uno.module.css';

const Game = ({ game, handleCardClick, handleDrawCard, handleUnoClick }) => {
  return (
    <div className={styles.game}>
      <Opponent player={game.players[2]} />
      <div className={styles.board}>
        <Card card={game.discardPile[0]} />
        <div className={styles.drawPile} onClick={handleDrawCard} title="Draw Card">
          <div className={styles.drawPileCard}></div>
          <div className={styles.drawPileCard}></div>
          <div className={styles.drawPileCard}></div>
          <div className={styles.drawPileCard}></div>
          <div className={styles.drawPileCard}></div>
        </div>
      </div>
      <button className={styles.unoGameButton} onClick={handleUnoClick}>
        Uno
      </button>
      <Player
        player={game.players[1]}
        isCurrentPlayer={game.currentPlayer === 1}
        handleCardClick={handleCardClick}
      />
    </div>
  );
};

export default Game;
