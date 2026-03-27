
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
  const deck = createDeck();
  const players = {
    1: { hand: [] },
    2: { hand: [] },
  };

  for (let i = 0; i < 7; i++) {
    players[1].hand.push(deck.pop());
    players[2].hand.push(deck.pop());
  }

  const discardPile = [deck.pop()];

  return {
    deck,
    players,
    discardPile,
    currentPlayer: 1,
    direction: 1,
    unoCalled: false,
    isColorPickerOpen: false,
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
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const handleCardClick = (game, card) => {
  if (game.currentPlayer !== 1) {
    return game;
  }

  if (!isCardPlayable(card, game.discardPile[0])) {
    return game;
  }

  const newGame = { ...game };
  const player = newGame.players[newGame.currentPlayer];

  player.hand = player.hand.filter(
    (c) => !(c.color === card.color && c.value === card.value)
  );

  newGame.discardPile.unshift(card);

  if (card.value === SPECIAL_CARDS.WILD || card.value === SPECIAL_CARDS.WILD_DRAW_FOUR) {
    newGame.isColorPickerOpen = true;
    return newGame;
  }

  if (card.value === SPECIAL_CARDS.SKIP) {
    newGame.currentPlayer = getNextPlayer(newGame);
  } else if (card.value === SPECIAL_CARDS.REVERSE) {
    newGame.direction *= -1;
  } else if (card.value === SPECIAL_CARDS.DRAW_TWO) {
    const nextPlayer = getNextPlayer(newGame);
    for (let i = 0; i < 2; i++) {
      newGame.players[nextPlayer].hand.push(newGame.deck.pop());
    }
  }

  newGame.currentPlayer = getNextPlayer(newGame);
  newGame.unoCalled = false;

  return newGame;
};

export const handleColorSelect = (game, color) => {
  const newGame = { ...game };
  newGame.discardPile[0].color = color;
  newGame.isColorPickerOpen = false;

  const card = newGame.discardPile[0];
  if (card.value === SPECIAL_CARDS.WILD_DRAW_FOUR) {
    const nextPlayer = getNextPlayer(newGame);
    for (let i = 0; i < 4; i++) {
      newGame.players[nextPlayer].hand.push(newGame.deck.pop());
    }
  }

  newGame.currentPlayer = getNextPlayer(newGame);
  return newGame;
};

export const handleDrawCard = (game) => {
  if (game.currentPlayer !== 1) {
    return game;
  }

  const newGame = { ...game };
  newGame.players[newGame.currentPlayer].hand.push(newGame.deck.pop());
  newGame.currentPlayer = getNextPlayer(newGame);
  return newGame;
};

export const handleUnoClick = (game) => {
  const newGame = { ...game };
  newGame.unoCalled = true;
  return newGame;
};

export const handlePCPlay = (game) => {
  if (game.currentPlayer !== 2) {
    return game;
  }

  const newGame = { ...game };
  const player = newGame.players[newGame.currentPlayer];
  const playableCards = player.hand.filter((card) =>
    isCardPlayable(card, newGame.discardPile[0])
  );

  if (playableCards.length > 0) {
    let card = playableCards[0];

    if (card.value === SPECIAL_CARDS.WILD || card.value === SPECIAL_CARDS.WILD_DRAW_FOUR) {
      const colors = ['red', 'yellow', 'green', 'blue'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      card.color = randomColor;
    }

    player.hand = player.hand.filter(
      (c) => !(c.color === card.color && c.value === card.value)
    );
    newGame.discardPile.unshift(card);

    if (card.value === SPECIAL_CARDS.SKIP) {
      newGame.currentPlayer = getNextPlayer(newGame);
    } else if (card.value === SPECIAL_CARDS.REVERSE) {
      newGame.direction *= -1;
    } else if (card.value === SPECIAL_CARDS.DRAW_TWO) {
      const nextPlayer = getNextPlayer(newGame);
      for (let i = 0; i < 2; i++) {
        newGame.players[nextPlayer].hand.push(newGame.deck.pop());
      }
    } else if (card.value === SPECIAL_CARDS.WILD_DRAW_FOUR) {
      const nextPlayer = getNextPlayer(newGame);
      for (let i = 0; i < 4; i++) {
        newGame.players[nextPlayer].hand.push(newGame.deck.pop());
      }
    }
  } else {
    newGame.players[newGame.currentPlayer].hand.push(newGame.deck.pop());
  }

  newGame.currentPlayer = getNextPlayer(newGame);
  return newGame;
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

export const isCardPlayable = (card, topOfDiscard) => {
  return (
    card.color === COLORS.BLACK ||
    card.color === topOfDiscard.color ||
    card.value === topOfDiscard.value
  );
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
