import { GameModel } from "../models/gameModel.js";

const game = new GameModel();

export function setupGameController(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 Jogador conectado: ${socket.id}`);
    game.addPlayer(socket.id);

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
      const result = game.playCard(socket.id, cardIndex, slotIndex);
      if (result.error) {
        socket.emit("errorMessage", result.error);
      }
      io.emit("state", game.getState());
    });

    // Quando o jogador desconecta
    socket.on("disconnect", () => {
      console.log(`❌ Jogador desconectado: ${socket.id}`);
      game.removePlayer(socket.id);
      io.emit("waiting", "Aguardando jogadores...");
    });
  });
}
