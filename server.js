// server.js
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { setupGameController } from "./controllers/gameController.js";

const app = express();
const server = http.createServer(app);

// serve arquivos estáticos em ./public
app.use(express.static("public"));

// cria WebSocketServer ligado ao mesmo HTTP server
const wss = new WebSocketServer({ server });

// configura o controller (vai ligar os handlers de conexão)
setupGameController(wss);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// cleanup ao Ctrl+C / kill
const cleanup = () => {
  console.log("\nEncerrando servidor...");
  try {
    wss.clients.forEach((c) => {
      try { c.close(); } catch {}
    });
    wss.close(() => console.log("WebSocketServer encerrado."));
  } catch (e) {
    console.error("Erro ao encerrar WebSocketServer:", e);
  }
  server.close(() => {
    console.log("Servidor HTTP encerrado.");
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 2000);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
