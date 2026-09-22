"use client";

import React from 'react';
import Link from 'next/link';
import './GamesLanding.css';

const GamesLanding = () => {
  const games = [
    {
      id: 'math-quiz',
      name: 'Magical Math',
      description: 'Test your brain power! Solve math puzzles to earn magical rewards and reach the victory screen.',
      icon: '✨',
      path: '/games/math-quiz',
      isComingSoon: false,
      badge: 'New!'
    },
    {
      id: 'unicorns-rainbows',
      name: 'Unicorns & Rainbows',
      description: 'A magical adventure! Ride the rainbows and avoid the rainclouds to reach the finish line.',
      icon: '🦄',
      path: '/games/unicorns-rainbows',
      isComingSoon: false,
    },
    {
      id: 'coin-exchange',
      name: 'Coin Exchange',
      description: 'A strategy game where you have to shift all your coins on the opposite side.',
      icon: '🪙',
      path: '/games/coin-exchange',
      isComingSoon: true,
    }
  ];

  return (
    <div className="games-container">
      <div className="games-header">
        <h1>Arcade Hub</h1>
        <p>Choose your adventure. Play with friends or challenge yourself.</p>
      </div>

      <div className="games-grid">
        {games.map((game) => (
          game.isComingSoon ? (
            <div key={game.id} className="game-card coming-soon">
              <div className="game-icon">{game.icon}</div>
              <h2>{game.name}</h2>
              <p>{game.description}</p>
              <div className="badge" style={{ background: '#475569' }}>Coming Soon</div>
            </div>
          ) : (
            <Link href={game.path} key={game.id} className="game-card">
              {game.badge && <div className="badge">{game.badge}</div>}
              <div className="game-icon">{game.icon}</div>
              <h2>{game.name}</h2>
              <p>{game.description}</p>
            </Link>
          )
        ))}
      </div>
    </div>
  );
};

export default GamesLanding;
