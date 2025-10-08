import { addPlayer, removePlayer, broadcast, playCard } from "../models/gameModel.js";

export function handleConnection(ws) {
  addPlayer(ws);

  ws.on("message", (data) => {
    const msg = JSON.parse(data);

    if (msg.type === "play") {
      const result = playCard(msg.playerId, msg.card, msg.x, msg.y);
      if (result.error) {
        ws.send(JSON.stringify({ type: "error", message: result.error }));
      } else {
        broadcast({
          type: "update",
          board: result.board,
          hands: result.hands,
          currentTurn: result.currentTurn,
        });
      }
    }
  });

  ws.on("close", () => removePlayer(ws));
}
