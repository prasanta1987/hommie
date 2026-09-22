"use client";

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import './MathQuiz.css';

const TRACKS = [
  'https://archive.org/download/TetrisThemeMusic/Tetris.mp3', // Tetris
  'https://archive.org/download/SuperMarioBros.ThemeMusic/SuperMarioBros.ogg', // Mario
  'https://archive.org/download/TheLegendOfZeldaTheme/The%20Legend%20of%20Zelda%20Theme.mp3', // Zelda
  'https://archive.org/download/super-mario-world/01.%20Title%20Theme.mp3' // Super Mario World
];

const MathQuiz = () => {
  const [gameState, setGameState] = useState('setup'); // setup, playing
  const [difficulty, setDifficulty] = useState('easy');
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [milestone, setMilestone] = useState(null); // null, 10, 20, 30
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [trackIndex, setTrackIndex] = useState(0);
  
  // Audio refs
  const bgMusic = useRef(null);
  const successSound = useRef(null);
  const milestoneSound = useRef(null);

  useEffect(() => {
    // Initialize audio (8-bit / Retro style)
    bgMusic.current = new Audio(TRACKS[0]);
    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.2;
    
    successSound.current = new Audio('https://archive.org/download/smw_coin/smw_coin.wav');
    successSound.current.volume = 0.5;
    
    milestoneSound.current = new Audio('https://archive.org/download/smw_1-up/smw_1-up.wav');
    milestoneSound.current.volume = 0.7;

    return () => {
      if (bgMusic.current) {
        bgMusic.current.pause();
      }
    };
  }, []);

  // Update audio track when trackIndex changes
  useEffect(() => {
    const handleAudioError = () => {
      console.warn("Track failed to load. Skipping to next track...");
      setTrackIndex((prev) => (prev + 1) % TRACKS.length);
    };

    if (bgMusic.current) {
      bgMusic.current.addEventListener('error', handleAudioError);
      
      const wasPlaying = !bgMusic.current.paused;
      bgMusic.current.src = TRACKS[trackIndex];
      bgMusic.current.load();
      if (soundEnabled && wasPlaying && gameState !== 'setup') {
        bgMusic.current.play().catch(e => console.log("Audio play blocked"));
      }

      return () => {
        bgMusic.current.removeEventListener('error', handleAudioError);
      };
    }
  }, [trackIndex, soundEnabled, gameState]);

  const toggleSound = () => {
    if (soundEnabled) {
      bgMusic.current?.pause();
    } else {
      if (gameState !== 'setup') bgMusic.current?.play().catch(e => console.log("Audio play blocked"));
    }
    setSoundEnabled(!soundEnabled);
  };

  const nextTrack = () => setTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const prevTrack = () => setTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);

  const generateProblem = (diff) => {
    let num1, num2, operator, answer;
    const ops = ['+', '-'];
    
    if (diff === 'easy') {
      // 1 to 10 + and -
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      operator = ops[Math.floor(Math.random() * ops.length)];
      if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1]; // no negatives
    } else if (diff === 'medium') {
      // 1 to 20 +/-, and simple * up to 5x5
      const mOps = ['+', '-', 'x'];
      operator = mOps[Math.floor(Math.random() * mOps.length)];
      if (operator === 'x') {
        num1 = Math.floor(Math.random() * 5) + 1;
        num2 = Math.floor(Math.random() * 5) + 1;
      } else {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
      }
    } else {
      // hard: 1 to 50 +/-, * up to 10x10
      const hOps = ['+', '-', 'x'];
      operator = hOps[Math.floor(Math.random() * hOps.length)];
      if (operator === 'x') {
        num1 = Math.floor(Math.random() * 10) + 2;
        num2 = Math.floor(Math.random() * 10) + 2;
      } else {
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 50) + 10;
        if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
      }
    }

    if (operator === '+') answer = num1 + num2;
    if (operator === '-') answer = num1 - num2;
    if (operator === 'x') answer = num1 * num2;

    // Generate 3 wrong options close to answer
    let wrongOptions = new Set();
    while (wrongOptions.size < 3) {
      let offset = Math.floor(Math.random() * 7) - 3;
      if (offset === 0) offset = 1;
      let wrong = answer + offset;
      if (wrong >= 0 && wrong !== answer) wrongOptions.add(wrong);
    }

    const allOptions = [answer, ...Array.from(wrongOptions)].sort(() => Math.random() - 0.5);

    setProblem({ text: `${num1} ${operator} ${num2} = ?`, answer });
    setOptions(allOptions);
    setSelectedOption(null);
  };

  const startGame = (diff) => {
    setDifficulty(diff);
    setScore(0);
    setMilestone(null);
    setGameState('playing');
    generateProblem(diff);
    
    if (soundEnabled) {
      bgMusic.current?.play().catch(e => console.log(e));
    }
  };

  const fireConfetti = (type) => {
    if (type === 'basic') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f472b6', '#c084fc', '#60a5fa']
      });
    } else if (type === 'hearts') {
      const defaults = { spread: 360, ticks: 100, gravity: 0, decay: 0.94, startVelocity: 30, shapes: ['heart'], colors: ['#FFC0CB', '#FF69B4', '#FF1493', '#C71585'] };
      confetti({ ...defaults, particleCount: 50, scalar: 2 });
      confetti({ ...defaults, particleCount: 25, scalar: 3 });
      confetti({ ...defaults, particleCount: 10, scalar: 4 });
    } else if (type === 'victory') {
      var duration = 3 * 1000;
      var animationEnd = Date.now() + duration;
      var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        var particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 }, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } }));
      }, 250);
    }
  };

  const handleAnswer = (option) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);
    
    if (option === problem.answer) {
      if (soundEnabled) successSound.current?.play().catch(e=>e);
      
      const newScore = score + 1;
      
      setTimeout(() => {
        setScore(newScore);
        if (newScore === 10) {
          setMilestone(10);
          if (soundEnabled) milestoneSound.current?.play().catch(e=>e);
          fireConfetti('basic');
        } else if (newScore === 20) {
          setMilestone(20);
          if (soundEnabled) milestoneSound.current?.play().catch(e=>e);
          fireConfetti('hearts');
        } else if (newScore === 30) {
          setMilestone(30);
          if (soundEnabled) milestoneSound.current?.play().catch(e=>e);
          fireConfetti('victory');
        } else {
          generateProblem(difficulty);
        }
      }, 1000);
    } else {
      // Wrong answer - shake animation handled by CSS
      setTimeout(() => {
        setSelectedOption(null); // let them try again!
      }, 600);
    }
  };

  const continueGame = () => {
    if (milestone === 30) {
      setGameState('setup');
      if (bgMusic.current) bgMusic.current.pause();
    } else {
      setMilestone(null);
      generateProblem(difficulty);
    }
  };

  return (
    <div className="math-container">
      <div className="music-controls">
        <button className="music-btn" onClick={prevTrack} title="Previous Track">
          ⏮️
        </button>
        <button className="music-btn" onClick={toggleSound} title="Toggle Mute">
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <button className="music-btn" onClick={nextTrack} title="Next Track">
          ⏭️
        </button>
      </div>

      {gameState === 'setup' ? (
        <div className="glass-panel">
          <div className="math-header">
            <h1 className="math-title">Magical Math! ✨</h1>
          </div>
          <h2>Choose Your Difficulty</h2>
          <div className="difficulty-buttons">
            <button className="diff-btn easy" onClick={() => startGame('easy')}>🌟 Easy (Addition & Subtraction)</button>
            <button className="diff-btn medium" onClick={() => startGame('medium')}>⭐ Medium (Up to 20 & Multiplication)</button>
            <button className="diff-btn hard" onClick={() => startGame('hard')}>🔥 Hard (Up to 50 & Big Multiplication)</button>
          </div>
        </div>
      ) : (
        <>
          <div className="math-header">
            <h1 className="math-title">Magical Math! ✨</h1>
            <div className="score-display">Stars: 🌟 {score}</div>
          </div>
          
          <div className="glass-panel">
            {problem && (
              <>
                <div className="problem-text">{problem.text}</div>
                <div className="options-grid">
                  {options.map((opt, i) => {
                    let className = 'option-btn';
                    if (selectedOption !== null) {
                      if (opt === problem.answer && selectedOption === opt) className += ' correct';
                      else if (selectedOption === opt) className += ' wrong';
                    }
                    return (
                      <button 
                        key={i} 
                        className={className}
                        onClick={() => handleAnswer(opt)}
                        disabled={selectedOption !== null}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Overlays */}
      {milestone === 10 && (
        <div className="splash-overlay">
          <h1>Great Job! 🌟</h1>
          <h2 style={{color: 'white', marginBottom: '2rem'}}>You reached 10 Stars!</h2>
          <button className="continue-btn" onClick={continueGame}>Keep Going!</button>
        </div>
      )}
      
      {milestone === 20 && (
        <div className="splash-overlay">
          <h1>Heart Party! 💖</h1>
          <h2 style={{color: 'white', marginBottom: '2rem'}}>You reached 20 Stars!</h2>
          <button className="continue-btn" onClick={continueGame}>Keep Going!</button>
        </div>
      )}

      {milestone === 30 && (
        <div className="splash-overlay">
          <h1>Math Genius! 🏆</h1>
          <h2 style={{color: 'white', marginBottom: '2rem'}}>You reached 30 Stars! You won!</h2>
          <button className="continue-btn" onClick={continueGame}>Play Again</button>
        </div>
      )}

    </div>
  );
};

export default MathQuiz;
