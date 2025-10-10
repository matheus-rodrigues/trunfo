// models/gameModel.js
export class GameModel {
  constructor() {
    this.nextId = 0; // para gerar ids (0,1,...)
    this.players = []; // lista de playerIds ativos
    this.hands = {}; // mapa playerId -> array de cartas
    this.deck = this._createShuffledDeck(); // deck embaralhado (LIFO: pop())
    this.board = [Array(5).fill(null)]; // board 1x5: board[0][0..4]
    this.currentTurn = null; // playerId que tem a vez
  }

  _createShuffledDeck() {
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
      "K",
    ];
    const deck = [];
    for (const s of suits) {
      for (const v of values) {
        deck.push({ suit: s, value: v });
      }
    }
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  // Retorna novo playerId (número)
  addPlayer() {
    const id = this.nextId++;
    this.players.push(id);
    this.hands[id] = [];

    // Dá 4 cartas iniciais
    for (let i = 0; i < 4; i++) {
      this._drawToHand(id);
    }

    // Se não há currentTurn definido, primeiro jogador começa
    if (this.currentTurn === null) this.currentTurn = id;

    return id;
  }

  removePlayer(playerId) {
    const idx = this.players.indexOf(playerId);
    if (idx !== -1) this.players.splice(idx, 1);
    delete this.hands[playerId];

    // Ajusta currentTurn se necessário
    if (this.currentTurn === playerId) {
      this.currentTurn = this.players.length ? this.players[0] : null;
    }
  }

  _drawToHand(playerId) {
    if (!this.hands[playerId]) this.hands[playerId] = [];
    if (this.deck.length === 0) return null;
    const card = this.deck.pop();
    this.hands[playerId].push(card);
    return card;
  }

  // Expõe drawCard (opcional)
  drawCard(playerId) {
    return this._drawToHand(playerId);
  }

  // Jogada de carta: card = { suit, value }, x = 0..4
  playCard(playerId, card, x) {
    // validações
    if (this.currentTurn !== playerId) {
      return { success: false, message: "Não é a sua vez!" };
    }
    if (typeof x !== "number" || x < 0 || x >= 5) {
      return { success: false, message: "Posição inválida!" };
    }
    if (this.board[0][x] !== null) {
      return { success: false, message: "Posição já ocupada!" };
    }
    const hand = this.hands[playerId] || [];
    const idx = hand.findIndex(
      (c) => c.suit === card.suit && c.value === card.value
    );
    if (idx === -1) {
      return { success: false, message: "Carta inválida!" };
    }

    // remove da mão e coloca no board
    const played = hand.splice(idx, 1)[0];
    this.board[0][x] = played;

    // quem jogou compra 1 carta (se houver)
    this._drawToHand(playerId);

    // alterna a vez para o próximo jogador (se houver)
    if (this.players.length > 1) {
      const curIdx = this.players.indexOf(playerId);
      const nextIdx = (curIdx + 1) % this.players.length;
      this.currentTurn = this.players[nextIdx];
    } else {
      // permanece o mesmo jogador se ele for o único conectado
      this.currentTurn = playerId;
    }

    return { success: true };
  }

  // Retorna estado serializável
  getState() {
    // clonamos hands superficialmente para evitar exposição de referências internas
    const handsCopy = {};
    this.players.forEach((p) => {
      handsCopy[p] = (this.hands[p] || []).slice();
    });
    return {
      board: this.board,
      hands: handsCopy,
      currentTurn: this.currentTurn,
    };
  }
}
