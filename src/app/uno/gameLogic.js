
export const COLORS = {
  RED: 'red',
  YELLOW: 'yellow',
  GREEN: 'green',
  BLUE: 'blue',
  BLACK: 'black',
};

export const SPECIAL_CARDS = {
  SKIP: 'skip',
  REVERSE: 'reverse',
  DRAW_TWO: 'draw-two',
  WILD: 'wild',
  WILD_DRAW_FOUR: 'wild-draw-four',
};

export const initGame = () => {
  let deck = createDeck();
  const players = {
    1: { hand: [] },
    2: { hand: [] },
  };

  for (let i = 0; i < 7; i++) {
    players[1].hand.push(deck.pop());
    players[2].hand.push(deck.pop());
  }

  let discardPile = [deck.pop()];
  if (discardPile[0].color === COLORS.BLACK) {
    discardPile[0].color = COLORS.RED; // Set a default color for wild cards
  }


  return {
    deck,
    players,
    discardPile,
    currentPlayer: 1,
    direction: 1,
    unoCalled: false,
    isColorPickerOpen: false,
    currentColor: discardPile[0].color,
  };
};

export const createDeck = () => {
  const deck = [];
  const colors = [COLORS.RED, COLORS.YELLOW, COLORS.GREEN, COLORS.BLUE];

  for (const color of colors) {
    for (let i = 0; i < 10; i++) {
      deck.push({ color, value: i });
    }
    for (let i = 1; i < 10; i++) {
      deck.push({ color, value: i });
    }
    for (let i = 0; i < 2; i++) {
      deck.push({ color, value: SPECIAL_CARDS.SKIP });
      deck.push({ color, value: SPECIAL_CARDS.REVERSE });
      deck.push({ color, value: SPECIAL_CARDS.DRAW_TWO });
    }
  }

  for (let i = 0; i < 4; i++) {
    deck.push({ color: COLORS.BLACK, value: SPECIAL_CARDS.WILD });
    deck.push({ color: COLORS.BLACK, value: SPECIAL_CARDS.WILD_DRAW_FOUR });
  }

  return shuffle(deck);
};

export const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const handleCardClick = (game, card) => {
  if (game.currentPlayer !== 1 || !isCardPlayable(card, game.discardPile[0], game.currentColor)) {
    return game;
  }

  const newHand = game.players[1].hand.filter(
    (c) => !(c.color === card.color && c.value === card.value)
  );

  let gameAfterPlay = {
    ...game,
    players: {
      ...game.players,
      1: { ...game.players[1], hand: newHand },
    },
    discardPile: [card, ...game.discardPile],
    unoCalled: false,
  };

  if (card.color === COLORS.BLACK) {
    return { ...gameAfterPlay, isColorPickerOpen: true };
  }

  gameAfterPlay = applyCardEffects(gameAfterPlay, card);
  return {
    ...gameAfterPlay,
    currentPlayer: getNextPlayer(gameAfterPlay),
    currentColor: card.color,
  };
};

export const handleColorSelect = (game, color) => {
  let gameAfterColorSelect = {
    ...game,
    currentColor: color,
    isColorPickerOpen: false,
  };

  const card = game.discardPile[0];
  gameAfterColorSelect = applyCardEffects(gameAfterColorSelect, card);

  return {
    ...gameAfterColorSelect,
    currentPlayer: getNextPlayer(gameAfterColorSelect),
  };
};

export const handleDrawCard = (game) => {
  if (game.currentPlayer !== 1) {
    return game;
  }

  const newDeck = [...game.deck];
  const newCard = newDeck.pop();

  return {
    ...game,
    deck: newDeck,
    players: {
      ...game.players,
      1: { ...game.players[1], hand: [...game.players[1].hand, newCard] },
    },
    currentPlayer: getNextPlayer(game),
  };
};

export const handleUnoClick = (game) => {
  return { ...game, unoCalled: true };
};

export const handlePCPlay = (game) => {
  if (game.currentPlayer !== 2) {
    return game;
  }

  const topOfDiscard = game.discardPile[0];
  const playableCards = game.players[2].hand.filter((card) =>
    isCardPlayable(card, topOfDiscard, game.currentColor)
  );

  if (playableCards.length > 0) {
    const cardToPlay = playableCards[0];
    const newHand = game.players[2].hand.filter(
      (c) => !(c.color === cardToPlay.color && c.value === cardToPlay.value)
    );

    let gameAfterPlay = {
      ...game,
      players: {
        ...game.players,
        2: { ...game.players[2], hand: newHand },
      },
      discardPile: [cardToPlay, ...game.discardPile],
    };

    if (cardToPlay.color === COLORS.BLACK) {
      const colors = [COLORS.RED, COLORS.YELLOW, COLORS.GREEN, COLORS.BLUE];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      gameAfterPlay.currentColor = randomColor;
    } else {
      gameAfterPlay.currentColor = cardToPlay.color;
    }

    gameAfterPlay = applyCardEffects(gameAfterPlay, cardToPlay);
    return { ...gameAfterPlay, currentPlayer: getNextPlayer(gameAfterPlay) };
  } else {
    const newDeck = [...game.deck];
    const newCard = newDeck.pop();
    return {
      ...game,
      deck: newDeck,
      players: {
        ...game.players,
        2: { ...game.players[2], hand: [...game.players[2].hand, newCard] },
      },
      currentPlayer: getNextPlayer(game),
    };
  }
};



export const checkGameOver = (game) => {
  return Object.values(game.players).some((player) => player.hand.length === 0);
};

export const checkWinner = (game) => {
  for (const playerId in game.players) {
    if (game.players[playerId].hand.length === 0) {
      return playerId;
    }
  }
  return null;
};

export const isCardPlayable = (card, topOfDiscard, currentColor) => {
  if (card.color === COLORS.BLACK) return true;
  if (topOfDiscard.color === COLORS.BLACK) {
    return card.color === currentColor;
  }
  return card.color === topOfDiscard.color || card.value === topOfDiscard.value;
};

export const getNextPlayer = (game) => {
  let nextPlayer = game.currentPlayer + game.direction;
  if (nextPlayer > Object.keys(game.players).length) {
    nextPlayer = 1;
  } else if (nextPlayer < 1) {
    nextPlayer = Object.keys(game.players).length;
  }
  return nextPlayer;
};

const applyCardEffects = (game, card) => {
  let newGame = { ...game };
  
  switch (card.value) {
    case SPECIAL_CARDS.SKIP:
      newGame.currentPlayer = getNextPlayer(newGame);
      break;
    case SPECIAL_CARDS.REVERSE:
      newGame.direction *= -1;
      break;
    case SPECIAL_CARDS.DRAW_TWO:
      const nextPlayerId_DT = getNextPlayer(game);
      const deckForDrawTwo = [...newGame.deck];
      const drawnCardsTwo = [deckForDrawTwo.pop(), deckForDrawTwo.pop()];
      newGame.deck = deckForDrawTwo;
      newGame.players = {
        ...newGame.players,
        [nextPlayerId_DT]: {
          ...newGame.players[nextPlayerId_DT],
          hand: [...newGame.players[nextPlayerId_DT].hand, ...drawnCardsTwo],
        },
      };
      newGame.currentPlayer = getNextPlayer(newGame);
      break;
    case SPECIAL_CARDS.WILD_DRAW_FOUR:
        const nextPlayerId_WDF = getNextPlayer(game);
        const deckForDrawFour = [...newGame.deck];
        const drawnCardsFour = [];
        for(let i=0; i<4; i++) {
            drawnCardsFour.push(deckForDrawFour.pop());
        }
        newGame.deck = deckForDrawFour;
        newGame.players = {
            ...newGame.players,
            [nextPlayerId_WDF]: {
            ...newGame.players[nextPlayerId_WDF],
            hand: [...newGame.players[nextPlayerId_WDF].hand, ...drawnCardsFour],
            },
        };
        newGame.currentPlayer = getNextPlayer(newGame);
      break;
  }

  return newGame;
};
