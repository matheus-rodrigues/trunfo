const ws = new WebSocket("ws://localhost:3000");
let playerId = null;
let currentTurn = null;
let hand = [];
let board = [];

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "init") {
    playerId = data.playerId;
    currentTurn = data.currentTurn;
    hand = data.hand;
    board = data.board;
    renderBoard();
    renderHand();
    updateTurnInfo();
  }

  if (data.type === "update") {
    board = data.board;
    currentTurn = data.currentTurn;
    hand = data.hands[playerId];
    renderBoard();
    renderHand();
    updateTurnInfo();
  }

  if (data.type === "error") alert(data.message);
  if (data.type === "status") updateTurnInfo(data.message);
};

function updateTurnInfo(extraMsg = "") {
  const el = document.getElementById("turn-info");
  el.textContent = extraMsg || (currentTurn === playerId
    ? "Sua vez de jogar!"
    : "Aguarde o outro jogador...");
}

function renderBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.textContent = cell ? cell.card[0] : "";
      slot.onclick = () => handleSlotClick(x, y);
      boardDiv.appendChild(slot);
    });
  });
}

function renderHand() {
  const handDiv = document.getElementById("hand");
  handDiv.innerHTML = "";
  hand.forEach((card) => {
    const c = document.createElement("button");
    c.textContent = card;
    c.onclick = () => selectCard(card);
    handDiv.appendChild(c);
  });
}

let selectedCard = null;
function selectCard(card) {
  selectedCard = card;
  alert(`Carta selecionada: ${card}. Escolha uma posição no tabuleiro.`);
}

function handleSlotClick(x, y) {
  if (!selectedCard) return alert("Selecione uma carta primeiro!");
  ws.send(JSON.stringify({ type: "play", playerId, card: selectedCard, x, y }));
  selectedCard = null;
}
