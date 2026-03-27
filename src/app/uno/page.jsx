
'use client'

import React, { useState, useEffect } from 'react';
import Game from './components/Game';
import ColorPicker from './components/ColorPicker';
import {
  initGame, 
  checkGameOver, 
  checkWinner, 
  handleCardClick, 
  handleDrawCard, 
  handleUnoClick,
  handlePCPlay,
  handleColorSelect
} from './gameLogic';
import styles from './uno.module.css';

const UnoGame = () => {
  const [game, setGame] = useState(null);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const newGame = initGame();
    setGame(newGame);
  }, []);

  useEffect(() => {
    if (game && checkGameOver(game)) {
      setWinner(checkWinner(game));
    }
  }, [game]);

  useEffect(() => {
    if (game && game.currentPlayer === 2 && !winner) {
      setTimeout(() => {
        const newGame = handlePCPlay(game);
        setGame(newGame);
      }, 1000);
    }
  }, [game, winner]);

  const handleCardClickWrapper = (card) => {
    const newGame = handleCardClick(game, card);
    setGame(newGame);
  };

  const handleDrawCardWrapper = () => {
    const newGame = handleDrawCard(game);
    setGame(newGame);
  };

  const handleUnoClickWrapper = () => {
    const newGame = handleUnoClick(game);
    setGame(newGame);
  };

  const handleColorSelectWrapper = (color) => {
    const newGame = handleColorSelect(game, color);
    setGame(newGame);
  };

  const handleRestart = () => {
    const newGame = initGame();
    setGame(newGame);
    setWinner(null);
  };

  return (
    <div className={styles.container}>
      {winner ? (
        <div className={styles.winner}>
          {`Player ${winner} wins!`}
          <button className={styles.unoButton} onClick={handleRestart}>
            Restart
          </button>
        </div>
      ) : (
        game && (
          <>
            <Game
              game={game}
              handleCardClick={handleCardClickWrapper}
              handleDrawCard={handleDrawCardWrapper}
              handleUnoClick={handleUnoClickWrapper}
            />
            {game.isColorPickerOpen && (
              <ColorPicker onSelectColor={handleColorSelectWrapper} />
            )}
          </>
        )
      )}
    </div>
  );
};

export default UnoGame;
