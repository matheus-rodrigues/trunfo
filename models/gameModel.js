export default class GameModel {
  constructor() {
    this.players = [];
    this.board = Array(5)
      .fill(null)
      .map(() => Array(5).fill(null));
    this.deck = this.createDeck();
    this.currentTurn = 0;
    this.hands = {};
  }

  createDeck() {
    const suits = ["♠", "♣", "♥", "♦"];
    const values = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K"
    ];
    const deck = [];
    for (const suit of suits) {
      for (const value of values) {
        deck.push({ suit, value });
      }
    }
    return this.shuffle(deck);
  }

  shuffle(deck) {
    return deck.sort(() => Math.random() - 0.5);
  }

  addPlayer(socketId) {
    const playerId = this.players.length;
    this.players.push(socketId);
    this.hands[playerId] = [];
    // dá 4 cartas iniciais
    for (let i = 0; i < 4; i++) {
      this.hands[playerId].push(this.deck.pop());
    }
    return playerId;
  }

  drawCard(playerId) {
    if (!this.hands[playerId]) return null;
    if (this.deck.length === 0) return null;
    const card = this.deck.pop();
    this.hands[playerId].push(card);
    return card;
  }

  playCard(playerId, card, x, y) {
    if (playerId !== this.currentTurn) {
      return { success: false, message: "Não é a sua vez!" };
    }

    if (x < 0 || x > 4 || y < 0 || y > 4) {
      return { success: false, message: "Posição inválida!" };
    }

    if (this.board[y][x]) {
      return { success: false, message: "Esta posição já está ocupada!" };
    }

    // verifica se a carta existe na mão
    const hand = this.hands[playerId];
    const index = hand.findIndex(
      (c) => c.suit === card.suit && c.value === card.value
    );
    if (index === -1) {
      return { success: false, message: "Carta inválida!" };
    }

    // remove da mão e coloca no board
    this.board[y][x] = hand.splice(index, 1)[0];

    // passa a vez
    this.currentTurn = (this.currentTurn + 1) % this.players.length;

    return { success: true };
  }
}
