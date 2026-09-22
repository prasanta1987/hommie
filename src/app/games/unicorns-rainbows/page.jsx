"use client";

import React, { useState, useEffect, useRef } from 'react';
import './UnicornsRainbows.css';

// Generate board tiles
const TILES = [];
for (let row = 9; row >= 0; row--) {
  if (row % 2 === 0) {
    for (let col = 1; col <= 10; col++) TILES.push(row * 10 + col);
  } else {
    for (let col = 10; col >= 1; col--) TILES.push(row * 10 + col);
  }
}

// Map tile number to grid coordinates (0 to 9)
const getTileCoords = (tileNumber) => {
  const index = TILES.indexOf(tileNumber);
  if (index === -1) return { x: 0, y: 0 };
  const row = Math.floor(index / 10);
  const col = index % 10;
  return { x: col, y: row };
};

const RAINBOWS = {
  3: 22,
  20: 41,
  28: 76,
  50: 67,
  71: 92,
  80: 99
};

const CLOUDS = {
  26: 10,
  39: 5,
  56: 18,
  73: 51,
  88: 66,
  98: 42
};

const PLAYER_COLORS = ['#ec4899', '#a855f7', '#3b82f6', '#10b981'];

const UnicornsRainbows = () => {
  const [gameState, setGameState] = useState('setup');
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');

  const startGame = () => {
    const newPlayers = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      position: 1, // Start at tile 1
      name: `Player ${i + 1}`
    }));
    setPlayers(newPlayers);
    setGameState('playing');
    setCurrentTurn(0);
    setDiceValue(null);
    setWinner(null);
    setMessage(`Game started! ${newPlayers[0].name}'s turn.`);
  };

  const handleRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    
    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 15) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setIsRolling(false); // Stop the dice spin animation
        
        // Wait 1 second so the user can read the dice before token moves
        setTimeout(() => {
          processTurn(finalRoll);
        }, 1000);
      }
    }, 50);
  };

  const processTurn = (roll) => {
    let newPlayers = [...players];
    let player = { ...newPlayers[currentTurn] };
    
    let newPos = player.position + roll;
    if (newPos > 100) {
      // Bounce back if overshoot
      const overshoot = newPos - 100;
      newPos = 100 - overshoot;
    }
    
    let msg = `${player.name} rolled a ${roll}!`;
    
    // Handle ladders and snakes
    if (RAINBOWS[newPos]) {
      msg += ` Yay! A rainbow took you from ${newPos} to ${RAINBOWS[newPos]}! 🌈`;
      newPos = RAINBOWS[newPos];
    } else if (CLOUDS[newPos]) {
      msg += ` Oh no! A raincloud dropped you from ${newPos} to ${CLOUDS[newPos]}. 🌧️`;
      newPos = CLOUDS[newPos];
    }
    
    player.position = newPos;
    newPlayers[currentTurn] = player;
    setPlayers(newPlayers);
    setMessage(msg);
    
    if (newPos === 100) {
      setWinner(player);
      setGameState('finished');
      return;
    }
    
    setTimeout(() => {
      setCurrentTurn((prev) => (prev + 1) % numPlayers);
    }, 1200);
  };

  if (gameState === 'setup') {
    return (
      <div className="unicorn-container">
        <h1 className="magical-title">Unicorns & Rainbows</h1>
        <div className="setup-panel">
          <h2>Select Number of Players</h2>
          <div className="player-selector">
            {[2, 3, 4].map(num => (
              <button 
                key={num} 
                className={numPlayers === num ? 'active' : ''}
                onClick={() => setNumPlayers(num)}
              >
                {num}
              </button>
            ))}
          </div>
          <button className="start-btn" onClick={startGame}>Start Magic Adventure!</button>
        </div>
      </div>
    );
  }

  return (
    <div className="unicorn-container">
      <div className="game-layout">
        <div className="side-panel">
          <h1 className="magical-title" style={{ fontSize: '2.5rem' }}>Unicorns &<br/>Rainbows</h1>
          
          <div className="current-turn" style={{ color: players[currentTurn].color }}>
            {players[currentTurn].name}'s Turn
          </div>
          
          <div className="dice-container">
            <div className={`dice-value ${isRolling ? 'rolling' : ''}`}>
              {diceValue ? diceValue : '🎲'}
            </div>
            <button 
              className="roll-btn" 
              onClick={handleRoll} 
              disabled={isRolling || gameState === 'finished'}
            >
              ROLL
            </button>
          </div>
          
          <div className="game-message">
            {message}
          </div>
        </div>

        <div className="board-container">
          <div className="board">
            {TILES.map((t, i) => {
              let extras = null;
              if (RAINBOWS[t]) extras = <span style={{fontSize: '1.2rem', position:'absolute', top: '2px', right: '4px'}}>🌈</span>;
              if (CLOUDS[t]) extras = <span style={{fontSize: '1.2rem', position:'absolute', top: '2px', right: '4px'}}>🌧️</span>;
              
              return (
                <div key={t} className="tile">
                  <span className="number">{t}</span>
                  {extras}
                </div>
              );
            })}

            {/* SVG overlay for drawing the connections and player tokens */}
            <svg className="overlay-svg" viewBox="0 0 1000 1000">
              <defs>
                <filter id="token-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Draw Rainbows */}
              {Object.entries(RAINBOWS).map(([start, end]) => {
                const sCoords = getTileCoords(parseInt(start));
                const eCoords = getTileCoords(parseInt(end));
                const sx = (sCoords.x + 0.5) * 100;
                const sy = (sCoords.y + 0.5) * 100;
                const ex = (eCoords.x + 0.5) * 100;
                const ey = (eCoords.y + 0.5) * 100;
                // Simple quadratic curve for rainbow
                const cx = (sx + ex) / 2 + 50;
                const cy = (sy + ey) / 2 - 50;
                return (
                  <path 
                    key={`rainbow-${start}`}
                    d={`M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`}
                    fill="none"
                    stroke="url(#rainbowGrad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    style={{ opacity: 0.6 }}
                  />
                );
              })}

              {/* Draw Rainclouds/Lightning */}
              {Object.entries(CLOUDS).map(([start, end]) => {
                const sCoords = getTileCoords(parseInt(start));
                const eCoords = getTileCoords(parseInt(end));
                const sx = (sCoords.x + 0.5) * 100;
                const sy = (sCoords.y + 0.5) * 100;
                const ex = (eCoords.x + 0.5) * 100;
                const ey = (eCoords.y + 0.5) * 100;
                // Zig zag for lightning
                const mx = (sx + ex) / 2 + 20;
                const my = (sy + ey) / 2;
                return (
                  <path 
                    key={`cloud-${start}`}
                    d={`M ${sx} ${sy} L ${mx} ${my} L ${ex} ${ey}`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="6"
                    strokeLinejoin="miter"
                    style={{ opacity: 0.8 }}
                  />
                );
              })}

              <defs>
                <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="25%" stopColor="#eab308" />
                  <stop offset="50%" stopColor="#22c55e" />
                  <stop offset="75%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>

              {/* Draw Player Tokens */}
              {players.map((player, index) => {
                const coords = getTileCoords(player.position);
                // Offset players on same tile
                const offsetAngle = (index / players.length) * 2 * Math.PI;
                const offsetRadius = players.filter(p => p.position === player.position).length > 1 ? 25 : 0;
                
                const cx = (coords.x + 0.5) * 100 + offsetRadius * Math.cos(offsetAngle);
                const cy = (coords.y + 0.5) * 100 + offsetRadius * Math.sin(offsetAngle);
                
                return (
                  <g key={player.id} className="player-token" style={{ transform: `translate(${cx}px, ${cy}px)` }}>
                    <circle cx="0" cy="0" r="30" fill={player.color} stroke="#fff" strokeWidth="4" filter="url(#token-shadow)" />
                    <text x="0" y="4" textAnchor="middle" dominantBaseline="middle" fontSize="35">🦄</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {gameState === 'finished' && winner && (
        <div className="winner-overlay">
          <h2>{winner.name} Wins! 🦄✨</h2>
          <button className="play-again-btn" onClick={() => setGameState('setup')}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default UnicornsRainbows;
