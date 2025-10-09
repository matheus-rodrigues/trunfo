const socket = io();
let playerId = null;
let currentTurn = 0;
let hand = [];
let selectedCard = null;

const boardEl = document.getElementById("board");
const handEl = document.getElementById("hand");
const messageEl = document.getElementById("message");
const turnEl = document.getElementById("turn");

// Renderiza tabuleiro
function renderBoard(board) {
  boardEl.innerHTML = "";
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const card = board[y][x];
      if (card) {
        cell.innerHTML = `<div class="card ${
          card.suit === "♥" || card.suit === "♦" ? "red" : "black"
        }">${card.value}${card.suit}</div>`;
      }
      cell.addEventListener("click", () => tryPlayCard(x, y));
      boardEl.appendChild(cell);
    }
  }
}

// Renderiza mão
function renderHand() {
  handEl.innerHTML = "";
  hand.forEach((card, index) => {
    const div = document.createElement("div");
    div.className = `card ${
      card.suit === "♥" || card.suit === "♦" ? "red" : "black"
    }`;
    div.textContent = `${card.value}${card.suit}`;
    div.addEventListener("click", () => selectCard(index));
    if (selectedCard === index) div.classList.add("selected");
    handEl.appendChild(div);
  });
}

// Seleciona carta
function selectCard(index) {
  selectedCard = selectedCard === index ? null : index;
  renderHand();
}

// Mostra mensagem
function showMessage(text) {
  messageEl.textContent = text;
  if (text) setTimeout(() => (messageEl.textContent = ""), 3000);
}

// Tenta jogar carta
function tryPlayCard(x, y) {
  if (selectedCard === null) {
    showMessage("Selecione uma carta antes de jogar.");
    return;
  }
  const card = hand[selectedCard];
  socket.emit("play", { card, x, y, playerId });
}

// Recebe dados do servidor
socket.on("init", (data) => {
  playerId = data.playerId;
  hand = data.hand;
  currentTurn = data.currentTurn;
  renderBoard(data.board);
  renderHand();
  updateTurn();
});

socket.on("update", (data) => {
  currentTurn = data.currentTurn;
  hand = data.hands[playerId];
  renderBoard(data.board);
  renderHand();
  updateTurn();
});

socket.on("error", (msg) => showMessage(msg));

socket.on("status", (data) => showMessage(data.message));

function updateTurn() {
  turnEl.textContent = `Vez do jogador ${currentTurn + 1}`;
}
