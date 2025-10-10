const socket = new WebSocket("ws://localhost:3000");

let playerId = null;
let hand = [];
let board = [];
let currentTurn = null;
let selectedCard = null;

const boardEl = document.getElementById("board");
const handEl = document.getElementById("hand");
const messageEl = document.getElementById("message");
const turnIndicator = document.getElementById("turn-indicator");

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "init") {
    playerId = data.playerId;
    hand = data.hand;
    board = data.board;
    currentTurn = data.currentTurn;
    renderBoard();
    renderHand();
    updateTurnIndicator();
  }

  if (data.type === "update") {
    board = data.board;
    hand = data.hands[playerId] || [];
    currentTurn = data.currentTurn;
    updateBoard();
    updateHand();
    updateTurnIndicator();
  }

  if (data.error) showMessage(data.error);
});

/* === Renderiza apenas uma vez === */
function renderBoard() {
  boardEl.innerHTML = "";
  const row = board[0] || [];

  row.forEach((card, x) => {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.x = x;

    if (card) {
      const cardEl = createCardElement(card);
      slot.appendChild(cardEl);
    }

    slot.addEventListener("click", () => playCard(x));
    boardEl.appendChild(slot);
  });
}

function renderHand() {
  handEl.innerHTML = "";
  hand.forEach((card, index) => {
    const cardEl = createCardElement(card);
    cardEl.dataset.index = index;
    cardEl.addEventListener("click", () => selectCard(index));
    handEl.appendChild(cardEl);
  });
}

/* === Atualiza apenas o conteúdo sem recriar === */
function updateBoard() {
  const row = board[0] || [];
  const slots = boardEl.querySelectorAll(".slot");

  row.forEach((card, x) => {
    const slot = slots[x];
    const existing = slot.querySelector(".card");

    if (!card && existing) {
      existing.remove();
    } else if (card && !existing) {
      slot.appendChild(createCardElement(card, true));
    }
  });
}

function updateHand() {
  const current = handEl.querySelectorAll(".card");

  // Remove cartas extras
  while (current.length > hand.length) {
    current[current.length - 1].remove();
  }

  // Atualiza ou adiciona novas
  hand.forEach((card, index) => {
    let cardEl = current[index];
    if (!cardEl) {
      cardEl = createCardElement(card, true);
      cardEl.dataset.index = index;
      cardEl.addEventListener("click", () => selectCard(index));
      handEl.appendChild(cardEl);
    } else {
      cardEl.textContent = `${card.value}${card.suit}`;
      cardEl.className = `card ${
        ["♥", "♦"].includes(card.suit) ? "red" : "black"
      }`;
      cardEl.dataset.index = index;
    }

    if (selectedCard === index) cardEl.classList.add("selected");
    else cardEl.classList.remove("selected");
  });
}

function createCardElement(card, smooth = false) {
  const el = document.createElement("div");
  el.classList.add("card", ["♥", "♦"].includes(card.suit) ? "red" : "black");
  el.textContent = `${card.value}${card.suit}`;
  if (smooth) el.style.transition = "all 0.25s ease";
  return el;
}

function selectCard(index) {
  selectedCard = selectedCard === index ? null : index;
  updateHand();
}

function playCard(x) {
  if (selectedCard === null) {
    showMessage("Selecione uma carta antes de jogar!");
    return;
  }
  if (playerId !== currentTurn) {
    showMessage("Não é a sua vez!");
    return;
  }

  const card = hand[selectedCard];
  socket.send(JSON.stringify({ type: "play", playerId, card, x }));
  selectedCard = null;
  updateHand();
}

function showMessage(text) {
  messageEl.textContent = text;
  messageEl.style.opacity = 1;
  setTimeout(() => (messageEl.style.opacity = 0), 3000);
}

function updateTurnIndicator() {
  if (playerId === currentTurn) {
    turnIndicator.textContent = "🎯 É a sua vez!";
    turnIndicator.style.color = "#00ff88";
  } else {
    turnIndicator.textContent = "🕓 Aguardando oponente...";
    turnIndicator.style.color = "#ffdf00";
  }
}
