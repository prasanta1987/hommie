
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
  formatHandString,
  parseCompactState
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
      const compactRef = ref(db, 'uno/compact');
      const unsubscribe = onValue(compactRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          // If we are P1 (Host), we only update if it's NOT our turn
          // If we are P2 (Joiner), we always update from compact
          const newState = parseCompactState(val, playerRole);
          setGame(prevGame => {
            // Keep the color picker open if it was already open locally
            if (prevGame && prevGame.isColorPickerOpen) return prevGame;
            
            // MASTER DECK LOGIC for Host (Player 1)
            if (playerRole === 1 && prevGame) {
              const remoteP = val.p || "";
              const remoteCards = remoteP ? remoteP.split(',') : [];
              const localDeckTop10 = prevGame.deck.slice(-10).reverse();
              
              if (remoteCards.length < localDeckTop10.length && prevGame.deck.length > 0) {
                const diff = localDeckTop10.length - remoteCards.length;
                const newMasterDeck = [...prevGame.deck];
                for(let i=0; i<diff; i++) {
                  if (newMasterDeck.length > 0) newMasterDeck.pop();
                }
                return { ...newState, deck: newMasterDeck };
              }
              // Host always keeps their full master deck if no draw occurred
              return { ...newState, deck: prevGame.deck };
            }

            return newState;
          });
          setLoading(false);
        }
      });
      return () => unsubscribe();
    }
  }, [isRemote, playerRole]);

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
    // Only push updates if we are the current player AND we aren't waiting for a color choice
    if (game && isRemote) {
      // if (game && isRemote && game.currentPlayer === playerRole && !game.isColorPickerOpen) {
      const topCard = game.discardPile[0];
      const p1Hand = game.players[1].hand;
      const p2Hand = game.players[2].hand;
      const syncDeck = game.deck.slice(-10).reverse();

      const compactState = {
        d: formatCard(topCard),
        c: game.currentColor === 'black' ? 'k' : (game.currentColor ? game.currentColor.charAt(0) : (topCard?.color === 'black' ? 'k' : (topCard?.color?.charAt(0) || 'r'))),
        t: game.currentPlayer - 1,
        p: syncDeck.map(formatCard).join(','),
        h1: formatHandString(p1Hand),
        h2: formatHandString(p2Hand),
        oc1: p1Hand.length,
        oc2: p2Hand.length
      };

      updateValuesToDatabase('uno/compact', compactState);
    }
  }, [game, isRemote, playerRole]);

  const updateGameState = (newGame) => {
    setGame(newGame);
    if (isRemote) {
      // Logic for pushing updates is handled by the useEffect above
    }
  };

  const handleCardClickWrapper = (card) => {
    if (isRemote && game.currentPlayer !== playerRole) return;
    const newGame = handleCardClick(game, card, isRemote);
    updateGameState(newGame);
  };

  const handleDrawCardWrapper = () => {
    if (isRemote && game.currentPlayer !== playerRole) return;
    const newGame = handleDrawCard(game, isRemote);
    updateGameState(newGame);
  };

  const handleUnoClickWrapper = () => {
    if (isRemote && game.currentPlayer !== playerRole) return;
    const newGame = handleUnoClick(game);
    updateGameState(newGame);
  };

  const handleColorSelectWrapper = (color) => {
    const newGame = handleColorSelect(game, color, isRemote);
    updateGameState(newGame);
  };

  const handleHostGame = () => {
    const newGame = initGame();
    setIsRemote(true);
    setPlayerRole(1);
    setWinner(null);
    setGame(newGame);

    const topCard = newGame.discardPile[0];
    const p1Hand = newGame.players[1].hand;
    const p2Hand = newGame.players[2].hand;
    const syncDeck = newGame.deck.slice(-10).reverse();
    const compactState = {
      d: formatCard(topCard),
      c: newGame.currentColor === 'black' ? 'k' : newGame.currentColor.charAt(0),
      t: 0,
      p: syncDeck.map(formatCard).join(','),
      h1: formatHandString(p1Hand),
      h2: formatHandString(p2Hand),
      oc1: p1Hand.length,
      oc2: p2Hand.length
    };
    updateValuesToDatabase('uno/compact', compactState);
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
