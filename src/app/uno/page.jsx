
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

  useEffect(() => {
    if (game) {
      const formatCard = (card) => {
        if (!card) return '';
        const color = card.color.charAt(0);
        let value;
        switch (card.value) {
          case 'skip':
            value = 's';
            break;
          case 'reverse':
            value = 'r';
            break;
          case 'draw-two':
            value = 'd2';
            break;
          case 'wild':
            value = 'w';
            break;
          case 'wild-draw-four':
            value = 'w4';
            break;
          default:
            value = card.value;
        }
        return color + value;
      };

      console.log(game.discardPile);

      const topCard = game.discardPile[game.discardPile.length - 1];
      const dadCardCount = game.players[1].hand.length;
      const daughterCardCount = game.players[2].hand.length;
      const isDadsTurn = game.currentPlayer === 1;

      const compactObject = {
        u: {
          d: formatCard(topCard),
          oc: isDadsTurn ? daughterCardCount : dadCardCount,
          t: game.currentPlayer - 1, // 0 for Dad (player 1), 1 for Daughter (player 2)
          p: game.deck.length,
        },
      };

      console.log('Compact Game State:', JSON.stringify(compactObject));
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
