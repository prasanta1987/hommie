
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

export const formatCard = (card) => {
  if (!card || !card.color) return '';
  const colorCode = card.color === COLORS.BLACK ? 'k' : card.color.charAt(0);
  let value;
  switch (card.value) {
    case SPECIAL_CARDS.SKIP:
      value = 's';
      break;
    case SPECIAL_CARDS.REVERSE:
      value = 'r';
      break;
    case SPECIAL_CARDS.DRAW_TWO:
      value = 'd2';
      break;
    case SPECIAL_CARDS.WILD:
      value = 'w';
      break;
    case SPECIAL_CARDS.WILD_DRAW_FOUR:
      value = 'w4';
      break;
    default:
      value = card.value;
  }
  return colorCode + value;
};

export const formatHandString = (hand) => {
  return hand.map(formatCard).join(',');
};

export const parseCompactCard = (s) => {
  if (!s || s === 'null') return { color: COLORS.RED, value: 0 }; // Default fallback

  const colorMap = {
    'r': COLORS.RED,
    'y': COLORS.YELLOW,
    'g': COLORS.GREEN,
    'b': COLORS.BLUE,
    'k': COLORS.BLACK,
    'w': COLORS.BLACK
  };

  const cPrefix = s[0];
  const color = colorMap[cPrefix] || COLORS.BLACK;
  const suffix = s.substring(1);

  let value;
  if (suffix === 's') value = SPECIAL_CARDS.SKIP;
  else if (suffix === 'r') value = SPECIAL_CARDS.REVERSE;
  else if (suffix === 'd2') value = SPECIAL_CARDS.DRAW_TWO;
  else if (suffix === 'w' || s === 'ww') value = SPECIAL_CARDS.WILD;
  else if (suffix === 'w4' || suffix === '4' || s === 'ww4') value = SPECIAL_CARDS.WILD_DRAW_FOUR;
  else value = isNaN(parseInt(suffix)) ? 0 : parseInt(suffix);

  return { color, value };
};

export const parseCompactState = (compact, playerRole) => {
  if (!compact) return null;

  const topCard = parseCompactCard(compact.d || 'r0');
  const currentColor = compact.c ?
    ({ 'r': COLORS.RED, 'y': COLORS.YELLOW, 'g': COLORS.GREEN, 'b': COLORS.BLUE, 'k': COLORS.BLACK }[compact.c] || topCard.color)
    : topCard.color;

  const h1Str = compact.h1 || '';
  const h2Str = compact.h2 || '';

  const h1 = h1Str ? h1Str.split(',').map(parseCompactCard) : [];
  const h2 = h2Str ? h2Str.split(',').map(parseCompactCard) : [];

  // Parse deck/draw-pile (p)
  let synchronizedDeck = [];
  if (typeof compact.p === 'string' && compact.p.length > 0) {
    synchronizedDeck = compact.p.split(',').map(parseCompactCard).reverse();
  } else if (typeof compact.p === 'number') {
    synchronizedDeck = new Array(compact.p).fill({ color: COLORS.RED, value: 0 }); // Placeholder deck
  } else {
    synchronizedDeck = new Array(20).fill({ color: COLORS.RED, value: 0 });
  }

  return {
    players: {
      1: { hand: h1 },
      2: { hand: h2 }
    },
    discardPile: [topCard],
    currentPlayer: (compact.t || 0) + 1,
    currentColor: currentColor,
    deck: synchronizedDeck,
    direction: 1,
    unoCalled: false,
    isColorPickerOpen: false,
    pendingWildCard: null
  };
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

  const initialCard = deck.pop();
  let discardPile = [initialCard];
  let currentColor = initialCard.color;

  if (initialCard.color === COLORS.BLACK) {
    const randomColor = [COLORS.RED, COLORS.YELLOW, COLORS.GREEN, COLORS.BLUE][Math.floor(Math.random() * 4)];
    discardPile = [{ ...initialCard, color: randomColor }];
    currentColor = randomColor;
  }

  return {
    deck,
    players,
    discardPile,
    currentPlayer: 1,
    direction: 1,
    unoCalled: false,
    isColorPickerOpen: false,
    currentColor,
    pendingWildCard: null,
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

export const handleCardClick = (game, card, isRemote = false) => {
  const pId = game.currentPlayer;
  const hand = game.players[pId].hand;
  if (!isCardPlayable(card, game.discardPile[0], game.currentColor, hand)) {
    return game;
  }

  const cardIndex = game.players[pId].hand.findIndex(
    (c) => c.color === card.color && c.value === card.value
  );
  if (cardIndex === -1) return game; // Card not in hand

  const newHand = [...game.players[pId].hand];
  newHand.splice(cardIndex, 1);

  if (card.color === COLORS.BLACK) {
    return {
      ...game,
      players: {
        ...game.players,
        [pId]: { ...game.players[pId], hand: newHand },
      },
      isColorPickerOpen: true,
      pendingWildCard: card,
      unoCalled: false,
    };
  }

  let gameAfterPlay = {
    ...game,
    players: {
      ...game.players,
      [pId]: { ...game.players[pId], hand: newHand },
    },
    discardPile: [card, ...game.discardPile],
    unoCalled: false,
    currentColor: card.color,
  };

  return applyCardEffects(gameAfterPlay, card, isRemote);
};

export const getRandomCard = () => {
  const colors = [COLORS.RED, COLORS.YELLOW, COLORS.GREEN, COLORS.BLUE];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const roll = Math.random() * 100;
  if (roll < 70) {
    return { color, value: Math.floor(Math.random() * 10) };
  } else if (roll < 90) {
    const specials = [SPECIAL_CARDS.SKIP, SPECIAL_CARDS.REVERSE, SPECIAL_CARDS.DRAW_TWO];
    return { color, value: specials[Math.floor(Math.random() * specials.length)] };
  } else {
    const wilds = [SPECIAL_CARDS.WILD, SPECIAL_CARDS.WILD_DRAW_FOUR];
    return { color: COLORS.BLACK, value: wilds[Math.floor(Math.random() * wilds.length)] };
  }
};

export const handleColorSelect = (game, color, isRemote = false) => {
  const pendingCard = game.pendingWildCard;
  if (!pendingCard) return game;

  const playedCard = { ...pendingCard, color: color };

  let gameAfterColorSelect = {
    ...game,
    currentColor: color,
    isColorPickerOpen: false,
    pendingWildCard: null,
    discardPile: [playedCard, ...game.discardPile],
  };

  return applyCardEffects(gameAfterColorSelect, pendingCard, isRemote);
};

export const handleDrawCard = (game, isRemote = false) => {
  const pId = game.currentPlayer;

  let newCard;
  let newDeck = [...game.deck];

  if (newDeck.length === 0 && game.discardPile.length > 1) {
    // Reshuffle discard pile into deck (excluding top card)
    const [topCard, ...toReshuffle] = game.discardPile;
    newDeck = shuffleArray(toReshuffle);
    game = { ...game, discardPile: [topCard] };
  }

  if (newDeck.length > 0) {
    newCard = newDeck.pop();
  } else if (isRemote) {
    // If deck is somehow empty in remote mode, fallback to random
    newCard = getRandomCard();
  } else {
    // Local mode fallback
    return game;
  }

  const newGame = {
    ...game,
    deck: newDeck,
    players: {
      ...game.players,
      [pId]: { ...game.players[pId], hand: [...game.players[pId].hand, newCard] },
    },
  };

  return {
    ...newGame,
    currentPlayer: getNextPlayer(newGame),
  };
};

export const handleUnoClick = (game) => {
  return { ...game, unoCalled: true };
};

export const handlePCPlay = (game) => {
  if (game.currentPlayer !== 2) {
    return game;
  }

  const pId = game.currentPlayer;
  const hand = game.players[pId].hand;
  const playableCards = hand.filter((card) =>
    isCardPlayable(card, topOfDiscard, game.currentColor, hand)
  );

  if (playableCards.length > 0) {
    const cardToPlay = playableCards[0];
    const cardToPlayIndex = game.players[2].hand.findIndex(
      (c) => c.color === cardToPlay.color && c.value === cardToPlay.value
    );
    const newHand = [...game.players[2].hand];
    newHand.splice(cardToPlayIndex, 1);

    let playedCard = cardToPlay;
    let newCurrentColor = cardToPlay.color;

    if (cardToPlay.color === COLORS.BLACK) {
      const colors = [COLORS.RED, COLORS.YELLOW, COLORS.GREEN, COLORS.BLUE];
      newCurrentColor = colors[Math.floor(Math.random() * colors.length)];
      playedCard = { ...cardToPlay, color: newCurrentColor };
    }

    let gameAfterPlay = {
      ...game,
      players: {
        ...game.players,
        2: { ...game.players[2], hand: newHand },
      },
      discardPile: [playedCard, ...game.discardPile],
      currentColor: newCurrentColor,
    };

    return applyCardEffects(gameAfterPlay, cardToPlay);
  } else {
    const newDeck = [...game.deck];
    const newCard = newDeck.pop();
    const newGame = {
      ...game,
      deck: newDeck,
      players: {
        ...game.players,
        2: { ...game.players[2], hand: [...game.players[2].hand, newCard] },
      },
    };
    return {
      ...newGame,
      currentPlayer: getNextPlayer(newGame),
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

// Basic playability check (color/value/wild match)
export const isBasicPlayable = (card, topOfDiscard, currentColor) => {
  // Shorthand fix: identify as Black/Wild by value even if shorthand prefix was wrong
  if (card.color === COLORS.BLACK || 
      card.value === SPECIAL_CARDS.WILD || 
      card.value === SPECIAL_CARDS.WILD_DRAW_FOUR) {
    return true;
  }

  if (topOfDiscard.color === COLORS.BLACK) {
    return card.color === currentColor;
  }
  return card.color === topOfDiscard.color || card.value === topOfDiscard.value;
};

// Full playability check with special rules (like +4 restriction)
export const isCardPlayable = (card, topOfDiscard, currentColor, hand = []) => {
  // Rule for Wild Draw 4 (+4): Only playable if NO other card can be played
  if (card.value === SPECIAL_CARDS.WILD_DRAW_FOUR) {
    const hasOtherPlayable = hand.some(c => 
      c !== card && 
      c.value !== SPECIAL_CARDS.WILD_DRAW_FOUR && 
      isBasicPlayable(c, topOfDiscard, currentColor)
    );
    if (hasOtherPlayable) return false;
    return true;
  }
  
  // All other cards (including normal Wilds) use basic logic
  return isBasicPlayable(card, topOfDiscard, currentColor);
};

export const getNextPlayer = (game) => {
  let nextPlayer = game.currentPlayer + game.direction;
  if (nextPlayer > 2) {
    nextPlayer = 1;
  } else if (nextPlayer < 1) {
    nextPlayer = 2;
  }
  return nextPlayer;
};

const applyCardEffects = (game, card, isRemote = false) => {
  let newGame = { ...game };

  // Default turn transition
  newGame.currentPlayer = getNextPlayer(newGame);

  switch (card.value) {
    case SPECIAL_CARDS.SKIP:
      newGame.currentPlayer = getNextPlayer(newGame);
      break;
    case SPECIAL_CARDS.REVERSE:
      newGame.direction *= -1;
      // In 2-player mode, Reverse acts like a Skip
      newGame.currentPlayer = getNextPlayer(game);
      break;
    case SPECIAL_CARDS.DRAW_TWO:
      const nextPlayerId_DT = getNextPlayer(game);
      const deckForDrawTwo = [...newGame.deck];
      let drawnCardsTwo;
      if (isRemote) {
        drawnCardsTwo = [getRandomCard(), getRandomCard()];
      } else {
        drawnCardsTwo = [deckForDrawTwo.pop(), deckForDrawTwo.pop()];
      }
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
      if (isRemote) {
        for (let i = 0; i < 4; i++) drawnCardsFour.push(getRandomCard());
      } else {
        for (let i = 0; i < 4; i++) drawnCardsFour.push(deckForDrawFour.pop());
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
