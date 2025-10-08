const players = [];
let board = Array(5)
  .fill(null)
  .map(() => Array(5).fill(null));

let currentTurn = 0; // índice do jogador (0 ou 1)
let hands = {}; // { playerId: [cartas] }

function generateCards() {
  const allCards = [
    "Dragão", "Mago", "Cavaleiro", "Elfo",
    "Gigante", "Guerreiro", "Anjo", "Demônio",
    "Fada", "Zumbi", "Troll", "Orc"
  ];
  return Array.from({ length: 4 }, () =>
    allCards[Math.floor(Math.random() * allCards.length)]
  );
}

export function addPlayer(ws) {
  if (players.length >= 2) {
    ws.send(JSON.stringify({ type: "error", message: "Sala cheia!" }));
    ws.close();
    return;
  }

  players.push(ws);
  const playerId = players.length - 1;
  hands[playerId] = generateCards();

  ws.send(
    JSON.stringify({
      type: "init",
      board,
      hand: hands[playerId],
      playerId,
      currentTurn,
    })
  );

  // Atualiza todos sobre o novo jogador
  broadcast({
    type: "status",
    message: `Jogador ${playerId + 1} entrou no jogo.`,
    currentTurn,
  });
}

export function removePlayer(ws) {
  const index = players.indexOf(ws);
  if (index !== -1) players.splice(index, 1);
}

export function playCard(playerId, card, x, y) {
  if (playerId !== currentTurn)
    return { error: "Não é sua vez!" };

  if (board[y][x] !== null)
    return { error: "Essa posição já está ocupada!" };

  const cardIndex = hands[playerId].indexOf(card);
  if (cardIndex === -1)
    return { error: "Carta não encontrada!" };

  // Coloca a carta no board e remove da mão
  board[y][x] = { playerId, card };
  hands[playerId].splice(cardIndex, 1);

  // Passa a vez
  currentTurn = currentTurn === 0 ? 1 : 0;

  return {
    board,
    hands,
    currentTurn,
  };
}

export function broadcast(data) {
  for (const player of players) {
    if (player.readyState === player.OPEN) {
      player.send(JSON.stringify(data));
    }
  }
}
