import { GameModel } from "../models/gameModel.js";

const game = new GameModel();

export function setupGameController(io) {
  // Mapeia socket.id para playerId persistente
  const socketIdToPlayerId = {};

  io.on("connection", (socket) => {
    const playerId = socket.handshake.auth.playerId || socket.id;
    socketIdToPlayerId[socket.id] = playerId;
    console.log(`🔌 Jogador conectado: ${socket.id} (playerId: ${playerId})`);

    game.addPlayer(playerId);

    // Garante que a vez está atribuída a alguém válido quando ambos conectam ou reconectam
    if (game.isReady()) {
      const playerIds = Object.keys(game.players);
      if (!game.currentTurn || !playerIds.includes(game.currentTurn)) {
        game.currentTurn = playerIds[0];
      }
    }

    // Se já temos 2 jogadores, inicia o jogo
    if (game.isReady()) {
      io.emit("state", game.getState());
    } else {
      io.emit("waiting", "Aguardando jogadores...");
    }

    // Envia o estado inicial para o novo jogador
    socket.emit("state", game.getState());

    // Quando o jogador tenta jogar uma carta
    socket.on("playCard", ({ cardIndex, slotIndex }) => {
      const pid = socketIdToPlayerId[socket.id] || socket.id;
      const result = game.playCard(pid, cardIndex, slotIndex);
      if (result.error) {
        socket.emit("errorMessage", result.error);
      }
      io.emit("state", game.getState());
    });

    // Quando o jogador desconecta
    socket.on("disconnect", () => {
      const pid = socketIdToPlayerId[socket.id] || socket.id;
      console.log(`❌ Jogador desconectado: ${socket.id} (playerId: ${pid})`);
      game.removePlayer(pid);
      delete socketIdToPlayerId[socket.id];
      io.emit("waiting", "Aguardando jogadores...");
    });
  });
}
