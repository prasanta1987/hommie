
# Blueprint: Uno Game

## Overview

This document outlines the plan to create a playable Uno game that can be played locally or remotely.

## Features

*   **Game Modes:**
    *   **Local:** Play against a PC opponent.
    *   **Remote:** Play against another person on a different device (to be implemented later).
*   **Gameplay:**
    *   Standard Uno rules.
    *   Playable cards light up.
    *   Special cards (Skip, Reverse, Draw Two, Wild, Wild Draw Four) are fully functional.
    *   The game ends when a player has no cards left.
    *   A restart button appears at the end of the game.
*   **PC Opponent:**
    *   The PC opponent will automatically play a card or draw a card when it's their turn.
*   **UI:**
    *   A clean and intuitive interface with a dark theme.
    *   Responsive design for different screen sizes.
    *   Icons on Draw 2, Draw 4, Reverse, Skip, and Wild cards for clarity.
    *   A color picker pop-up for Wild and Wild Draw 4 cards.
*   **Logging:**
    *   The game state is logged to the console as a JSON object every time it changes.

## Plan

1.  **State Management:**
    *   Use React's `useState` hook to manage the game state, including the deck, player hands, discard pile, current turn, and UI state for the color picker.
2.  **Game Logic:**
    *   A `gameLogic.js` file handles all game-related functions, such as initializing the game, drawing cards, playing cards, and checking for a winner.
    *   The logic for wild cards will be updated to incorporate a color selection step.
3.  **PC Opponent Logic:**
    *   A `handlePCPlay` function in `gameLogic.js` will determine the PC's move.
    *   The `useEffect` hook in `page.jsx` will trigger the PC's turn.
4.  **Components:**
    *   Separate components for the game board, player hands, and cards.
    *   A new `ColorPicker.jsx` component for the color selection pop-up.
5.  **Styling:**
    *   A `uno.module.css` file to style the game, including the new color picker.
6.  **Remote Play:**
    *   For the initial version, I will focus on local play. Remote play will be added in a future update and will use Firebase Realtime Database to synchronize the game state.
