
'use client'

import React, { useState, useEffect } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { db } from '@/firebaseConfig/config';
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
  handleColorSelect,
  formatCard,
  formatHandString
} from './gameLogic';
import styles from './uno.module.css';
import { updateValuesToDatabase } from '@/app/miscFunctions/actions.js'

const UnoGame = () => {
  const [game, setGame] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isRemote, setIsRemote] = useState(false);
  const [playerRole, setPlayerRole] = useState(1); // 1 for P1 (Host), 2 for P2 (Guest/ESP32)
  const [loading, setLoading] = useState(false);

  // Remote Sync Logic
  useEffect(() => {
    if (isRemote) {
      setLoading(true);
      const gameRef = ref(db, 'uno/game');
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          setGame(val);
          setLoading(false);
        }
      });
      return () => unsubscribe();
    }
  }, [isRemote]);

  useEffect(() => {
    if (game && checkGameOver(game)) {
      setWinner(checkWinner(game));
    }
  }, [game]);

  // PC Auto-play (only in Local mode)
  useEffect(() => {
    if (!isRemote && game && game.currentPlayer === 2 && !winner) {
      setTimeout(() => {
        const newGame = handlePCPlay(game);
        setGame(newGame);
      }, 1000);
    }
  }, [game, winner, isRemote]);

  // Firebase Compact State Updates
  useEffect(() => {
    if (game || isRemote) {
      const topCard = game.discardPile[0];
      const p1Hand = game.players[1].hand;
      const p2Hand = game.players[2].hand;

      const compactState = {
        d: formatCard(topCard),
        c: game.currentColor.charAt(0),
        t: game.currentPlayer - 1,
        p: game.deck.length,
        h1: formatHandString(p1Hand),
        h2: formatHandString(p2Hand),
        oc1: p1Hand.length,
        oc2: p2Hand.length
      };

      console.log(compactState)

      updateValuesToDatabase('uno/compact', compactState);
      // set(ref(db, 'uno/compact'), compactState);
    }
  }, [game, isRemote]);

  const updateGameState = (newGame) => {
    setGame(newGame);
    if (isRemote) {
      console.log(newGame);
      // set(ref(db, 'uno/game'), newGame);
    }
  };

  const handleCardClickWrapper = (card) => {
    if (isRemote && game.currentPlayer !== playerRole) return;
    const newGame = handleCardClick(game, card);
    updateGameState(newGame);
  };

  const handleDrawCardWrapper = () => {
    if (isRemote && game.currentPlayer !== playerRole) return;
    const newGame = handleDrawCard(game);
    updateGameState(newGame);
  };

  const handleUnoClickWrapper = () => {
    if (isRemote && game.currentPlayer !== playerRole) return;
    const newGame = handleUnoClick(game);
    updateGameState(newGame);
  };

  const handleColorSelectWrapper = (color) => {
    const newGame = handleColorSelect(game, color);
    updateGameState(newGame);
  };

  const handleHostGame = () => {
    const newGame = initGame();
    setIsRemote(true);
    setPlayerRole(1);
    setWinner(null);
    setGame(newGame); // Set locally immediately
    // set(ref(db, 'uno/game'), newGame);
  };

  const handleJoinGame = () => {
    setIsRemote(true);
    setPlayerRole(2);
    setWinner(null);
  };

  const handleLocalGame = () => {
    const newGame = initGame();
    setIsRemote(false);
    setPlayerRole(1);
    setGame(newGame);
    setWinner(null);
  };

  const handleRestart = () => {
    if (isRemote) {
      if (playerRole === 1) handleHostGame();
    } else {
      handleLocalGame();
    }
  };

  // Prepare roles for Game component
  const getGameProps = () => {
    if (!game) return null;
    if (isRemote && playerRole === 2) {
      return {
        game: {
          ...game,
          players: {
            1: game.players[2], // Swap for display
            2: game.players[1]
          },
          currentPlayer: game.currentPlayer === 2 ? 1 : 2 // Swap turn indicator for display
        }
      };
    }
    return { game };
  };

  const gameProps = getGameProps();

  return (
    <div className={styles.container}>
      {!game && !isRemote ? (
        <div className={styles.menu}>
          <h1>UNO Game</h1>
          <div className={styles.menuButtons}>
            <button className={styles.unoGameButton} onClick={handleLocalGame} style={{ position: 'static', margin: '10px' }}>
              Play vs PC
            </button>
            <button className={styles.unoGameButton} onClick={handleHostGame} style={{ position: 'static', margin: '10px' }}>
              Host PvP
            </button>
            <button className={styles.unoGameButton} onClick={handleJoinGame} style={{ position: 'static', margin: '10px' }}>
              Join PvP
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className={styles.menu}>
          <h1>Connecting...</h1>
          <p>Please wait while we sync the game state.</p>
        </div>
      ) : (
        winner ? (
          <div className={styles.winner}>
            {`Player ${winner} wins!`}
            <button className={styles.unoButton} onClick={handleRestart}>
              Restart
            </button>
          </div>
        ) : (
          game && (
            <>
              <div className={styles.modeBadge}>
                {isRemote ? `PvP (Player ${playerRole})` : 'vs PC'}
              </div>
              <Game
                {...gameProps}
                handleCardClick={handleCardClickWrapper}
                handleDrawCard={handleDrawCardWrapper}
                handleUnoClick={handleUnoClickWrapper}
              />
              {game.isColorPickerOpen && (game.currentPlayer === playerRole || !isRemote) && (
                <ColorPicker onSelectColor={handleColorSelectWrapper} />
              )}
            </>
          )
        )
      )}
    </div>
  );
};

export default UnoGame;
