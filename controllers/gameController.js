// controllers/gameController.js
import { GameModel } from "../models/gameModel.js";

/**
 * Exporta setupGameController(wss)
 * - wss: instancia de WebSocketServer (da lib 'ws')
 *
 * Mensagens enviadas ao cliente:
 *  - { type: "init", playerId, hand, board, currentTurn }
 *  - { type: "update", board, hands, currentTurn }
 *  - { error: "mensagem" } (somente para o cliente que errou)
 */
export function setupGameController(wss) {
  const game = new GameModel();

  // helper para broadcast do estado atual
  function broadcastState() {
    const state = game.getState();
    const payload = JSON.stringify({
      type: "update",
      board: state.board,
      hands: state.hands,
      currentTurn: state.currentTurn,
    });

    wss.clients.forEach((client) => {
      if (client.readyState === 1) client.send(payload);
    });
  }

  wss.on("connection", (ws) => {
    console.log("Cliente conectado (ws)");

    // Cria jogador e retorna playerId (número)
    const playerId = game.addPlayer();
    ws.playerId = playerId;

    // Envia estado inicial somente para este cliente
    ws.send(
      JSON.stringify({
        type: "init",
        playerId,
        hand: game.hands[playerId],
        board: game.board,
        currentTurn: game.currentTurn,
      })
    );

    // Em seguida, atualiza todos (para que o novo jogador e o outro vejam o estado)
    broadcastState();

    ws.on("message", (msg) => {
      let data;
      try {
        data = JSON.parse(msg.toString());
      } catch (err) {
        ws.send(JSON.stringify({ error: "Payload JSON inválido" }));
        return;
      }

      if (data.type === "play") {
        // Segurança: garantir que o playerId enviado bate com o playerId da conexão
        if (data.playerId !== ws.playerId) {
          ws.send(JSON.stringify({ error: "playerId inválido/forjado" }));
          return;
        }

        // Esperamos que data.card seja { value, suit } e data.x seja índice 0..4
        const result = game.playCard(data.playerId, data.card, data.x);
        if (!result.success) {
          ws.send(JSON.stringify({ error: result.message }));
          return;
        }

        // Sucesso -> broadcast para todos
        broadcastState();
      }

      // (ponto de extensão: mais eventos como 'draw' podem ser adicionados aqui)
    });

    ws.on("close", () => {
      console.log("Cliente desconectou:", ws.playerId);
      game.removePlayer(ws.playerId);
      broadcastState();
    });

    ws.on("error", (err) => {
      console.error("WS error:", err);
    });
  });

  console.log("Game controller configurado no WebSocketServer.");
}
