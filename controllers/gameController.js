import { GameModel } from "../models/gameModel.js";
import crypto from "crypto";

// Estruturas para salas e pareamento
const rooms = new Map(); // roomCode -> { code, mode, game, players: Map<playerId, meta> }
const playerToRoom = new Map(); // playerId -> roomCode
const waitingRandomRooms = []; // roomCodes aguardando adversário aleatório
const sessionTokens = new Map(); // playerId -> sessionToken

// Gera um token de sessão único e seguro
function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Gera um playerId único
function generatePlayerId() {
  return "p_" + crypto.randomBytes(16).toString("hex");
}

function generateRoomCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  do {
    code = Array.from({ length: 5 })
      .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
      .join("");
  } while (rooms.has(code));
  return code;
}

// Valida o token de sessão
function validateSession(playerId, sessionToken) {
  return sessionTokens.get(playerId) === sessionToken;
}

function normalizeCode(code) {
  return typeof code === "string" ? code.trim().toUpperCase() : "";
}

function ensureRoom(code, mode = "code") {
  if (!rooms.has(code)) {
    rooms.set(code, {
      code,
      mode,
      game: new GameModel(),
      players: new Map(),
    });
  }
  return rooms.get(code);
}

function registerPlayer(room, playerId, playerName) {
  if (room.players.size >= 2 && !room.players.has(playerId)) {
    throw new Error("Sala cheia");
  }
  const meta = room.players.get(playerId) || {};
  meta.name = playerName || meta.name || `Jogador ${room.players.size + 1}`;
  meta.socketId = null;
  meta.connected = false;
  room.players.set(playerId, meta);
  playerToRoom.set(playerId, room.code);
}

function cleanupRoomIfEmpty(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;
  const activePlayers = room.game ? Object.keys(room.game.players || {}) : [];
  const hasActive =
    activePlayers.length > 0 ||
    Array.from(room.players.values()).some((p) => p.connected);
  if (!hasActive) {
    rooms.delete(roomCode);
    const index = waitingRandomRooms.indexOf(roomCode);
    if (index !== -1) waitingRandomRooms.splice(index, 1);
    room.players.forEach((_, pid) => playerToRoom.delete(pid));
  }
}

export function setupLobbyRoutes(app, rateLimiter) {
  app.post("/api/create-room", rateLimiter, (req, res) => {
    const { playerName } = req.body || {};
    if (!playerName || typeof playerName !== "string" || !playerName.trim()) {
      return res
        .status(400)
        .json({ error: "Nome do jogador é obrigatório." });
    }

    // Gera playerId e token no servidor
    const playerId = generatePlayerId();
    const sessionToken = generateSessionToken();
    sessionTokens.set(playerId, sessionToken);

    const roomCode = generateRoomCode();
    const room = ensureRoom(roomCode, "code");

    try {
      registerPlayer(room, playerId, playerName.trim().slice(0, 50));
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    return res.json({ roomCode, playerId, sessionToken });
  });

  app.post("/api/join-room", rateLimiter, (req, res) => {
    const { playerName, roomCode } = req.body || {};
    if (!playerName || typeof playerName !== "string" || !playerName.trim()) {
      return res.status(400).json({
        error: "Nome do jogador é obrigatório.",
      });
    }
    if (!roomCode || typeof roomCode !== "string") {
      return res.status(400).json({
        error: "Código da sala é obrigatório.",
      });
    }

    const normalized = normalizeCode(roomCode);
    const room = rooms.get(normalized);
    if (!room) {
      return res.status(404).json({ error: "Sala não encontrada." });
    }

    // Gera playerId e token no servidor
    const playerId = generatePlayerId();
    const sessionToken = generateSessionToken();
    sessionTokens.set(playerId, sessionToken);

    try {
      registerPlayer(room, playerId, playerName.trim().slice(0, 50));
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    return res.json({ roomCode: normalized, playerId, sessionToken });
  });

  app.post("/api/join-random", rateLimiter, (req, res) => {
    const { playerName } = req.body || {};
    if (!playerName || typeof playerName !== "string" || !playerName.trim()) {
      return res
        .status(400)
        .json({ error: "Nome do jogador é obrigatório." });
    }

    // Gera playerId e token no servidor
    const playerId = generatePlayerId();
    const sessionToken = generateSessionToken();
    sessionTokens.set(playerId, sessionToken);

    let roomCode;
    while (waitingRandomRooms.length) {
      const candidate = waitingRandomRooms.shift();
      const candidateRoom = rooms.get(candidate);
      if (candidateRoom && candidateRoom.players.size < 2) {
        roomCode = candidate;
        try {
          registerPlayer(candidateRoom, playerId, playerName.trim().slice(0, 50));
        } catch (err) {
          return res.status(400).json({ error: err.message });
        }
        candidateRoom.mode = "random";
        return res.json({ roomCode, playerId, sessionToken });
      }
    }

    roomCode = generateRoomCode();
    const room = ensureRoom(roomCode, "random");

    try {
      registerPlayer(room, playerId, playerName.trim().slice(0, 50));
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    waitingRandomRooms.push(roomCode);
    return res.json({ roomCode, playerId, sessionToken });
  });
}

export function setupGameController(io) {
  io.on("connection", (socket) => {
    const auth = socket.handshake.auth || {};
    const playerId = auth.playerId;
    const sessionToken = auth.sessionToken;
    const playerName = auth.playerName;
    const roomCode = normalizeCode(auth.roomCode);

    // Validação de autenticação
    if (!playerId || !sessionToken || !roomCode) {
      socket.emit(
        "errorMessage",
        "Não foi possível identificar a sala ou o jogador."
      );
      socket.disconnect(true);
      return;
    }

    // Valida o token de sessão
    if (!validateSession(playerId, sessionToken)) {
      socket.emit("errorMessage", "Sessão inválida ou expirada.");
      socket.disconnect(true);
      return;
    }

    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit("errorMessage", "Sala inexistente ou expirada.");
      socket.disconnect(true);
      return;
    }

    const meta = room.players.get(playerId) || {};
    meta.name = playerName || meta.name || `Jogador ${room.players.size + 1}`;
    meta.socketId = socket.id;
    meta.connected = true;
    room.players.set(playerId, meta);
    playerToRoom.set(playerId, roomCode);

    socket.join(roomCode);

    room.game.addPlayer(playerId, meta.name);

    if (room.game.isReady()) {
      const idx = waitingRandomRooms.indexOf(roomCode);
      if (idx !== -1) waitingRandomRooms.splice(idx, 1);
    }

    const emitState = () => {
      io.to(roomCode).emit("state", room.game.getState());
    };

    emitState();

    if (!room.game.isReady()) {
      io.to(roomCode).emit("waiting", "Aguardando jogadores...");
    } else {
      // Notifica a sala que o jogador entrou
      socket.to(roomCode).emit("systemMessage", {
        message: `${meta.name} entrou na partida`,
      });
    }

    // Throttling simples: limita eventos por socket
    const throttle = {
      chatMessage: { lastTime: 0, minInterval: 500 }, // 500ms entre mensagens
      playCard: { lastTime: 0, minInterval: 300 }, // 300ms entre jogadas
    };

    // Handler de mensagens do chat
    socket.on("chatMessage", ({ message }) => {
      // Throttling
      const now = Date.now();
      if (now - throttle.chatMessage.lastTime < throttle.chatMessage.minInterval) {
        return; // Ignora silenciosamente se muito rápido
      }
      throttle.chatMessage.lastTime = now;

      if (!message || typeof message !== "string") return;

      const sanitized = message.trim().slice(0, 200);
      if (!sanitized) return;

      // Validação adicional: remove caracteres potencialmente perigosos
      const safe = sanitized.replace(/[<>]/g, "");

      io.to(roomCode).emit("chatMessage", {
        playerName: meta.name,
        message: safe,
      });
    });

    socket.on("playCard", ({ cardIndex, slotIndex }) => {
      // Throttling
      const now = Date.now();
      if (now - throttle.playCard.lastTime < throttle.playCard.minInterval) {
        socket.emit("errorMessage", "Aguarde um momento antes de jogar novamente.");
        return;
      }
      throttle.playCard.lastTime = now;

      // Converte para inteiros para validação
      const cardIdx = parseInt(cardIndex, 10);
      const slotIdx = parseInt(slotIndex, 10);

      // O gameModel já valida, mas fazemos uma verificação básica aqui também
      if (!Number.isInteger(cardIdx) || !Number.isInteger(slotIdx)) {
        socket.emit("errorMessage", "Dados inválidos.");
        return;
      }

      const result = room.game.playCard(playerId, cardIdx, slotIdx);
      if (result.error) {
        socket.emit("errorMessage", result.error);
        return;
      }

      // Se houver missões completas, emite evento de notificação para a sala
      if (result.completedMissions && result.completedMissions.length > 0) {
        result.completedMissions.forEach((completion) => {
          io.to(roomCode).emit("missionCompleted", {
            playerId: completion.playerId,
            playerName: completion.playerName,
            mission: completion.mission,
            board: completion.boardSnapshot,
          });
        });
      }

      // Se o jogo terminou, emite evento de fim de jogo
      if (result.gameOver) {
        io.to(roomCode).emit("gameOver", result.gameOver);
      }

      emitState();
    });

    socket.on("disconnect", () => {
      const currentRoomCode = playerToRoom.get(playerId);
      const currentRoom = currentRoomCode ? rooms.get(currentRoomCode) : null;
      if (!currentRoom) {
        playerToRoom.delete(playerId);
        return;
      }

      const info = currentRoom.players.get(playerId);
      if (info) {
        // Notifica a sala que o jogador saiu
        socket.to(currentRoomCode).emit("systemMessage", {
          message: `${info.name} saiu da partida`,
        });

        info.connected = false;
        info.socketId = null;
        currentRoom.players.set(playerId, info);
      }

      currentRoom.game.removePlayer(playerId);

      if (!currentRoom.game.isReady()) {
        io.to(currentRoomCode).emit("waiting", "Aguardando jogadores...");
      }

      io.to(currentRoomCode).emit("state", currentRoom.game.getState());

      cleanupRoomIfEmpty(currentRoomCode);
    });
  });
}
