// Import card mapping utilities
import { getCardClass } from "./cardMapping.js";

// Gera ou recupera um playerId persistente
function getOrCreatePlayerId() {
  let pid = localStorage.getItem("playerId");
  if (!pid) {
    pid = "p_" + Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem("playerId", pid);
  }
  return pid;
}
const playerId = getOrCreatePlayerId();
const playerName = localStorage.getItem("playerName") || "Jogador";
const roomCode = localStorage.getItem("roomCode");
const matchType = localStorage.getItem("matchType") || "code";

// Para partidas aleatórias, o roomCode existe internamente mas não será mostrado.
if (!roomCode) {
  window.location.href = "/";
}

const socket = io({
  auth: { playerId, playerName, roomCode },
});

const boardEl = document.getElementById("board");
const handEl = document.getElementById("hand");
const messageEl = document.getElementById("message");
let state = {};
let paused = false;
const missionsBoardEl = document.getElementById("missions-board");
const playersBoardEl = document.getElementById("players-board");
const scoreBarEl = document.getElementById("score-bar");
const notificationEl = document.getElementById("mission-notification");
const notificationPlayerEl = document.getElementById("notification-player");
const notificationMessageEl = document.getElementById("notification-message");

// Elementos da tela de fim de jogo
const gameOverScreen = document.getElementById("game-over-screen");
const winnerNameEl = document.getElementById("winner-name");
const finalScoresEl = document.getElementById("final-scores");

// Elementos do chat
const chatContainer = document.getElementById("chat-container");
const chatToggle = document.getElementById("chat-toggle");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");

// Toggle do chat (minimizar/expandir)
chatToggle.addEventListener("click", () => {
  chatContainer.classList.toggle("minimized");
  chatToggle.textContent = chatContainer.classList.contains("minimized")
    ? "+"
    : "−";
});

// Função para adicionar mensagem ao chat
function addChatMessage(message, type = "other", senderName = "") {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("chat-message", type);

  if (type === "system") {
    msgDiv.textContent = message;
  } else {
    const nameSpan = document.createElement("strong");
    nameSpan.textContent = senderName;
    msgDiv.appendChild(nameSpan);
    msgDiv.appendChild(document.createTextNode(message));
  }

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Limita o histórico a 50 mensagens
  while (chatMessages.children.length > 50) {
    chatMessages.removeChild(chatMessages.firstChild);
  }
}

// Enviar mensagem
function sendChatMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  socket.emit("chatMessage", { message });
  chatInput.value = "";
}

chatSend.addEventListener("click", sendChatMessage);

chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendChatMessage();
  }
});

// Receber mensagens do chat
socket.on("chatMessage", (data) => {
  const { playerName: senderName, message } = data;
  const isOwn = senderName === playerName;
  const type = isOwn ? "own" : "other";
  addChatMessage(message, type, senderName);
});

// Mensagem do sistema (jogador entrou/saiu)
socket.on("systemMessage", (data) => {
  addChatMessage(data.message, "system");
});

// Handler para missão completa
socket.on("missionCompleted", (data) => {
  const { playerName, mission, board } = data;

  // Mostra notificação
  notificationPlayerEl.textContent = playerName;
  notificationMessageEl.textContent = `completou: ${mission.description} (+${mission.points} pts)`;
  notificationEl.classList.remove("hidden");

  // Identifica cartas do board envolvidas (todas as não-null)
  const cardSlots = document.querySelectorAll(".card-slot");
  board.forEach((card, idx) => {
    if (card && cardSlots[idx]) {
      const cardInSlot = cardSlots[idx].querySelector(".card");
      if (cardInSlot) {
        cardInSlot.classList.add("mission-complete-card");
      }
    }
  });

  // Remove notificação e highlights após 3.5 segundos
  setTimeout(() => {
    notificationEl.classList.add("hidden");
    document.querySelectorAll(".mission-complete-card").forEach((card) => {
      card.classList.remove("mission-complete-card");
    });
  }, 3500);
});

// Handler para fim de jogo
socket.on("gameOver", (data) => {
  const { winnerName, players } = data;

  // Mostra tela de vitória
  winnerNameEl.textContent = winnerName;

  // Ordena jogadores por pontos (maior primeiro)
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  // Renderiza pontuações finais
  finalScoresEl.innerHTML = sortedPlayers
    .map((player, index) => {
      const medal = index === 0 ? "🥇" : "🥈";
      return `<div class="game-over-score-item">
        ${medal} ${player.name}: <strong style="color: #ffd700">${player.points} pontos</strong>
      </div>`;
    })
    .join("");

  gameOverScreen.classList.remove("hidden");
  paused = true;
});

socket.on("waiting", (msg) => {
  // Exibe código apenas para partidas por código
  if (matchType !== "random" && roomCode) {
    messageEl.innerHTML = `${msg}<br><span style="font-size:0.8em; color:#ffd700">Código da sala: <strong>${roomCode}</strong></span>`;
  } else {
    messageEl.textContent = msg;
  }
  paused = true;
});

socket.on("errorMessage", (msg) => {
  messageEl.textContent = msg;
});

socket.on("state", (gameState) => {
  state = gameState;
  // Só retoma se houver 2 jogadores
  if (state.players && Object.keys(state.players).length === 2) {
    paused = false;
    messageEl.textContent = "";
  }
  renderGame();
});

function renderGame() {
  // Pontuação centralizada (jogador1 X jogador2) e vez do jogador
  if (state.players) {
    const localPlayerId = localStorage.getItem("playerId") || playerId;
    const playersArr = Object.values(state.players);
    const localPlayer = state.players[localPlayerId] || null;
    const opponent = playersArr.find((p) => p.id !== localPlayerId) || null;

    const localName = localPlayer?.name || playerName;
    const opponentName =
      opponent?.name || (playersArr.length === 2 ? "Jogador" : "Aguardando");

    const leftScore = `<span style='color:#fff'>${localName}</span> <span style='color:#ffd700'>(${
      localPlayer?.points || 0
    })</span>`;
    const rightScore = opponent
      ? `<span style='color:#fff'>${opponentName}</span> <span style='color:#ffd700'>(${
          opponent.points || 0
        })</span>`
      : `<span style='color:#fff'>${opponentName}</span>`;

    let vezText = "";
    if (state.currentTurn) {
      const currentPlayer = state.players[state.currentTurn];
      if (currentPlayer) {
        const currentName = currentPlayer.name || "Jogador";
        vezText = `Vez de: ${currentName}`;
      }
    }
    let turnoText = `<span style='font-size:0.8em;color:#ffd700'>Turno: ${
      state.turnCount || 1
    }</span>`;
    // Inclui código da sala somente se não for partida aleatória
    const roomCodeLine =
      matchType !== "random" && roomCode
        ? `<div style='font-size:0.6em;color:#ffd700'>Sala: <strong>${roomCode}</strong></div>`
        : "";

    scoreBarEl.innerHTML = `${leftScore} <span style='color:#ffd700'>X</span> ${rightScore}<br>${turnoText}<br><span style='font-size:0.7em;color:#fff'>${
      vezText || ""
    }</span>${roomCodeLine}`;

    // Missões concluídas à direita (usa completedMissions)
    let completedHtml = playersArr
      .map((p) => {
        let completed = p.completedMissions || [];
        // Pega as 3 mais recentes
        const recent = completed.slice(-3).reverse();
        const nome = p.name || "Jogador";
        if (!recent.length)
          return `<div style='margin-bottom:18px'><strong>Jogador ${nome}</strong><br><span style='color:#aaa'>Nenhuma missão concluída</span></div>`;
        return `<div style='margin-bottom:18px'><strong>Jogador ${nome}</strong><ul>${recent
          .map(
            (m) =>
              `<li><span style='color:#ffd700'>${m.description}</span> <span style='color:#aaa'>[${m.points} pts]</span></li>`
          )
          .join("")}</ul></div>`;
      })
      .join("");
    playersBoardEl.innerHTML = `<h3>Missões concluídas: </h3>${completedHtml}`;
  }
  if (!state || !state.players) return;

  if (paused) {
    return;
  }

  // Usa playerId persistente para identificar o jogador
  const localPlayerId = localStorage.getItem("playerId") || playerId;
  const player = state.players && state.players[localPlayerId];
  if (!player) {
    messageEl.textContent = "Aguardando outro jogador...";
    return;
  }

  // Missões do jogador à esquerda
  if (player.missions && Array.isArray(player.missions)) {
    let missionsHtml = player.missions
      .map((m, idx) => {
        return `<li${
          m.completed ? ' style="text-decoration:line-through;color:#aaa"' : ""
        }><strong>${m.description}</strong> <span style="color:#ffd700">[${
          m.points
        } pts]</span></li>`;
      })
      .join("");
    missionsBoardEl.innerHTML = `<h3>Suas missões</h3><ul>${missionsHtml}</ul>`;
  } else {
    missionsBoardEl.innerHTML = "";
  }

  // Mensagem principal removida (agora está no score-bar)

  // Renderiza board
  boardEl.innerHTML = "";

  state.board.forEach((card, i) => {
    const div = document.createElement("div");
    div.classList.add("card-slot");

    if (state.lockedSlots && state.lockedSlots.includes(i)) {
      div.classList.add("locked");
    }

    if (card) {
      const cardDiv = document.createElement("div");
      cardDiv.className = `card-image ${getCardClass(card)}`;
      div.appendChild(cardDiv);
    }

    div.addEventListener("click", () => {
      if (paused) return;
      const selected = document.querySelector(".selected");
      if (selected) {
        const cardIndex = selected.dataset.index;
        socket.emit("playCard", {
          cardIndex: parseInt(cardIndex),
          slotIndex: i,
        });
        selected.classList.remove("selected");
      }
    });

    boardEl.appendChild(div);
  });

  // Renderiza mão
  handEl.innerHTML = "";
  player.hand.forEach((card, index) => {
    const div = document.createElement("div");
    div.className = `card-image ${getCardClass(card)}`;
    div.dataset.index = index;

    div.addEventListener("click", () => {
      if (paused) return;
      document
        .querySelectorAll(".card-image")
        .forEach((c) => c.classList.remove("selected"));
      div.classList.add("selected");
    });

    handEl.appendChild(div);
  });
}
