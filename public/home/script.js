// Elementos do DOM
const playerNameInput = document.getElementById("player-name");
const btnRoom = document.getElementById("btn-room");
const btnCode = document.getElementById("btn-code");
const btnRandom = document.getElementById("btn-random");
// Modal código
const modalCode = document.getElementById("modal-code");
const modalCodeClose = document.getElementById("modal-code-close");
const modalCodeCancel = document.getElementById("modal-code-cancel");
const modalCodeConfirm = document.getElementById("modal-code-confirm");
const joinRoomCodeInput = document.getElementById("join-room-code");

function getOrCreatePlayerId() {
  let pid = localStorage.getItem("playerId");
  if (!pid) {
    pid = "p_" + Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem("playerId", pid);
  }
  return pid;
}

const playerId = getOrCreatePlayerId();

function persistSession({ playerName, roomCode, matchType }) {
  localStorage.setItem("playerName", playerName);
  localStorage.setItem("playerId", playerId);
  localStorage.setItem("roomCode", roomCode);
  localStorage.setItem("matchType", matchType);
}

async function postJSON(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Não foi possível completar a operação.");
  }
  return data;
}

// Modal de erro
const modalError = document.getElementById("modal-error");
const modalErrorMsg = document.getElementById("modal-error-message");
const modalErrorClose = document.getElementById("modal-error-close");
const modalErrorOk = document.getElementById("modal-error-ok");

function showError(message) {
  if (!modalError || !modalErrorMsg) {
    // Fallback se modal não carregar
    alert(message);
    return;
  }
  modalErrorMsg.textContent = message;
  modalError.classList.remove("hidden");
  modalError.setAttribute("aria-hidden", "false");
}

function hideError() {
  if (!modalError) return;
  modalError.classList.add("hidden");
  modalError.setAttribute("aria-hidden", "true");
}

modalErrorClose?.addEventListener("click", hideError);
modalErrorOk?.addEventListener("click", hideError);
modalError?.addEventListener("click", (e) => {
  if (e.target === modalError) hideError();
});

// Modal Código functions
function showCodeModal() {
  if (!modalCode) return;
  joinRoomCodeInput.value = "";
  modalCode.classList.remove("hidden");
  modalCode.setAttribute("aria-hidden", "false");
  setTimeout(() => joinRoomCodeInput.focus(), 50);
}

function hideCodeModal() {
  if (!modalCode) return;
  modalCode.classList.add("hidden");
  modalCode.setAttribute("aria-hidden", "true");
}

modalCodeClose?.addEventListener("click", hideCodeModal);
modalCodeCancel?.addEventListener("click", hideCodeModal);
modalCode?.addEventListener("click", (e) => {
  if (e.target === modalCode) hideCodeModal();
});
joinRoomCodeInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    modalCodeConfirm?.click();
  }
});

// Função para validar nome do jogador
function validatePlayerName() {
  const name = playerNameInput.value.trim();
  if (!name) {
    showError("Por favor, insira seu nome");
    return false;
  }
  return name;
}

async function handleCreateRoom() {
  const playerName = validatePlayerName();
  if (!playerName) return;
  try {
    const { roomCode } = await postJSON("/api/create-room", {
      playerName,
      playerId,
    });
    persistSession({ playerName, roomCode, matchType: "code" });
    window.location.href = "/game";
  } catch (err) {
    showError(err.message);
  }
}

async function attemptJoinWithCode(inputCode) {
  const playerName = validatePlayerName();
  if (!playerName) return;
  if (!inputCode) {
    showError("Digite um código de sala válido");
    return;
  }
  try {
    const { roomCode } = await postJSON("/api/join-room", {
      playerName,
      playerId,
      roomCode: inputCode,
    });
    persistSession({ playerName, roomCode, matchType: "code" });
    window.location.href = "/game";
  } catch (err) {
    showError(err.message);
  }
}

function handleJoinWithCode() {
  const playerName = validatePlayerName();
  if (!playerName) return;
  showCodeModal();
}

modalCodeConfirm?.addEventListener("click", () => {
  const code = joinRoomCodeInput.value.trim();
  hideCodeModal();
  attemptJoinWithCode(code);
});

async function handlePlayRandom() {
  const playerName = validatePlayerName();
  if (!playerName) return;

  try {
    const { roomCode } = await postJSON("/api/join-random", {
      playerName,
      playerId,
    });
    // Persistimos o roomCode internamente para handshake, mas ocultaremos na interface do jogo
    persistSession({ playerName, roomCode, matchType: "random" });
    window.location.href = "/game";
  } catch (err) {
    showError(err.message);
  }
}

// Event listeners
btnRoom.addEventListener("click", handleCreateRoom);
btnCode.addEventListener("click", handleJoinWithCode);
btnRandom.addEventListener("click", handlePlayRandom);

// Permitir envio com Enter
playerNameInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    handlePlayRandom();
  }
});
