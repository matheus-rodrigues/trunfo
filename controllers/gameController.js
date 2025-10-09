import GameModel from "../models/gameModel.js";

let game;

export function setupGame(io) {
  game = new GameModel();

  io.on("connection", (socket) => {
    console.log("Novo jogador conectado:", socket.id);

    const playerId = game.addPlayer(socket.id);
    console.log("Player ID:", playerId);

    socket.emit("init", {
      playerId,
      hand: game.hands[playerId],
      board: game.board,
      currentTurn: game.currentTurn
    });

    io.emit("status", { message: `Jogador ${playerId + 1} entrou no jogo!` });

    socket.on("play", ({ card, x, y, playerId }) => {
      const result = game.playCard(playerId, card, x, y);

      if (!result.success) {
        socket.emit("error", result.message);
      } else {
        io.emit("update", {
          board: game.board,
          hands: game.hands,
          currentTurn: game.currentTurn
        });
      }
    });

    socket.on("draw", (playerId) => {
      const card = game.drawCard(playerId);
      socket.emit("drawn", card);
    });
  });
}
