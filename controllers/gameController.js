import { GameModel } from "../models/gameModel.js";

// Estruturas para salas e pareamento
const rooms = new Map(); // roomCode -> { code, mode, game, players: Map<playerId, meta> }
const playerToRoom = new Map(); // playerId -> roomCode
const waitingRandomRooms = []; // roomCodes aguardando adversário aleatório

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

export function setupLobbyRoutes(app) {
  app.post("/api/create-room", (req, res) => {
    const { playerName, playerId } = req.body || {};
    if (!playerName || !playerId) {
      return res
        .status(400)
        .json({ error: "Nome e identificador do jogador são obrigatórios." });
    }

    const roomCode = generateRoomCode();
    const room = ensureRoom(roomCode, "code");

    try {
      registerPlayer(room, playerId, playerName);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    return res.json({ roomCode, playerId });
  });

  app.post("/api/join-room", (req, res) => {
    const { playerName, playerId, roomCode } = req.body || {};
    if (!playerName || !playerId || !roomCode) {
      return res.status(400).json({
        error: "Nome, identificador e código da sala são obrigatórios.",
      });
    }

    const normalized = normalizeCode(roomCode);
    const room = rooms.get(normalized);
    if (!room) {
      return res.status(404).json({ error: "Sala não encontrada." });
    }

    try {
      registerPlayer(room, playerId, playerName);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    return res.json({ roomCode: normalized, playerId });
  });

  app.post("/api/join-random", (req, res) => {
    const { playerName, playerId } = req.body || {};
    if (!playerName || !playerId) {
      return res
        .status(400)
        .json({ error: "Nome e identificador do jogador são obrigatórios." });
    }

    let roomCode;
    while (waitingRandomRooms.length) {
      const candidate = waitingRandomRooms.shift();
      const candidateRoom = rooms.get(candidate);
      if (candidateRoom && candidateRoom.players.size < 2) {
        roomCode = candidate;
        try {
          registerPlayer(candidateRoom, playerId, playerName);
        } catch (err) {
          return res.status(400).json({ error: err.message });
        }
        candidateRoom.mode = "random";
        return res.json({ roomCode, playerId });
      }
    }

    roomCode = generateRoomCode();
    const room = ensureRoom(roomCode, "random");

    try {
      registerPlayer(room, playerId, playerName);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    waitingRandomRooms.push(roomCode);
    return res.json({ roomCode, playerId });
  });
}

export function setupGameController(io) {
  io.on("connection", (socket) => {
    const auth = socket.handshake.auth || {};
    const playerId = auth.playerId;
    const playerName = auth.playerName;
    const roomCode = normalizeCode(auth.roomCode);

    if (!playerId || !roomCode) {
      socket.emit(
        "errorMessage",
        "Não foi possível identificar a sala ou o jogador."
      );
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

    // Handler de mensagens do chat
    socket.on("chatMessage", ({ message }) => {
      if (!message || typeof message !== "string") return;

      const sanitized = message.trim().slice(0, 200);
      if (!sanitized) return;

      io.to(roomCode).emit("chatMessage", {
        playerName: meta.name,
        message: sanitized,
      });
    });

    socket.on("playCard", ({ cardIndex, slotIndex }) => {
      const result = room.game.playCard(playerId, cardIndex, slotIndex);
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
