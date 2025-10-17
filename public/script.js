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

const socket = io({
  auth: { playerId },
});

const boardEl = document.getElementById("board");
const handEl = document.getElementById("hand");
const messageEl = document.getElementById("message");
let state = {};
let paused = false;
const missionsBoardEl = document.getElementById("missions-board");
const playersBoardEl = document.getElementById("players-board");
const scoreBarEl = document.getElementById("score-bar");

socket.on("waiting", (msg) => {
  messageEl.textContent = msg;
  paused = true;
  // Limpa o board e painéis para indicar pausa
  boardEl.innerHTML = "";
  handEl.innerHTML = "";
  missionsBoardEl.innerHTML = "";
  playersBoardEl.innerHTML = "";
  scoreBarEl.innerHTML = "";
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
    renderGame();
  }
});

function renderGame() {
  // Pontuação centralizada (jogador1 X jogador2) e vez do jogador
  if (paused) {
    // Não renderiza nada se estiver pausado
    return;
  }
  if (state.players) {
    const localPlayerId = localStorage.getItem("playerId") || playerId;
    const playersArr = Object.values(state.players);
    let scoreText = "";
    if (playersArr.length === 2) {
      scoreText = `<span style='color:#fff'>${
        playersArr[0].points || 0
      }</span> <span style='color:#ffd700'>X</span> <span style='color:#fff'>${
        playersArr[1].points || 0
      }</span>`;
    } else if (playersArr.length === 1) {
      scoreText = `<span style='color:#fff'>${
        playersArr[0].points || 0
      }</span> <span style='color:#ffd700'>X</span> <span style='color:#fff'>0</span>`;
    }
    let vezText;
    if (!state.currentTurn) {
      vezText = "";
    } else if (state.currentTurn === localPlayerId) {
      vezText = "Vez de: Você";
    } else {
      // Descobre o nome do oponente
      const oponente = playersArr.find((p) => p.id === state.currentTurn);
      vezText = oponente ? `Vez de: Oponente` : "Vez de: Oponente";
    }
    let turnoText = `<span style='font-size:0.8em;color:#ffd700'>Turno: ${
      state.turnCount || 1
    }</span>`;
    scoreBarEl.innerHTML = `${scoreText}<br>${turnoText}<br><span style='font-size:0.7em;color:#fff'>${vezText}</span>`;

    // Missões concluídas à direita (usa completedMissions)
    let completedHtml = playersArr
      .map((p) => {
        let completed = p.completedMissions || [];
        // Pega as 3 mais recentes
        const recent = completed.slice(-3).reverse();
        const nome = p.id === localPlayerId ? "(Você)" : "Oponente";
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
      cardDiv.classList.add("card");
      cardDiv.classList.add(card.color === "red" ? "red" : "black");
      cardDiv.textContent = `${card.value}${card.suit}`;
      div.appendChild(cardDiv);
    }

    div.addEventListener("click", () => {
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
    div.classList.add("card");
    div.textContent = `${card.value}${card.suit}`;
    div.classList.add(card.color === "red" ? "red" : "black");
    div.dataset.index = index;

    div.addEventListener("click", () => {
      document
        .querySelectorAll(".card")
        .forEach((c) => c.classList.remove("selected"));
      div.classList.add("selected");
    });

    handEl.appendChild(div);
  });
}
