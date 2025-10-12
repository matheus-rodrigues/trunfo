const socket = io();

const boardEl = document.getElementById("board");
const handEl = document.getElementById("hand");
const messageEl = document.getElementById("message");
let state = {};
const missionsBoardEl = document.getElementById("missions-board");
const playersBoardEl = document.getElementById("players-board");
const scoreBarEl = document.getElementById("score-bar");

socket.on("waiting", (msg) => {
  messageEl.textContent = msg;
});

socket.on("errorMessage", (msg) => {
  messageEl.textContent = msg;
});

socket.on("state", (gameState) => {
  state = gameState;
  // Limpa mensagem de espera ao receber o estado do jogo
  messageEl.textContent = "";
  renderGame();
});

function renderGame() {
  // Pontuação centralizada (jogador1 X jogador2) e vez do jogador
  if (state.players) {
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
    let vezText = `Vez de: ${
      state.currentTurn === socket.id ? "Você" : "Oponente"
    }`;
    scoreBarEl.innerHTML = `${scoreText}<br><span style='font-size:0.7em;color:#fff'>${vezText}</span>`;

    // Missões concluídas à direita (usa completedMissions)
    let completedHtml = playersArr
      .map((p) => {
        let completed = p.completedMissions || [];
        if (!completed.length)
          return `<div style='margin-bottom:18px'><strong>Jogador ${
            p.id === socket.id ? "(Você)" : p.id
          }</strong><br><span style='color:#aaa'>Nenhuma missão concluída</span></div>`;
        return `<div style='margin-bottom:18px'><strong>Jogador ${
          p.id === socket.id ? "(Você)" : p.id
        }</strong><ul>${completed
          .map(
            (m) =>
              `<li><span style='color:#ffd700'>${m.description}</span> <span style='color:#aaa'>[${m.points} pts]</span></li>`
          )
          .join("")}</ul></div>`;
      })
      .join("");
    playersBoardEl.innerHTML = `<h3>Missões concluídas</h3>${completedHtml}`;
  }
  if (!state || !state.players) return;

  const playerId = socket.id;
  const player = state.players[playerId];
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
