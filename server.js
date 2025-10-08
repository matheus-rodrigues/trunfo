import express from "express";
import { WebSocketServer } from "ws";
import { handleConnection } from "./controllers/gameController.js";

const app = express();
const PORT = 3000;

// Servir os arquivos estáticos (front-end)
app.use(express.static("public"));

// Cria o servidor HTTP e o servidor WebSocket
const server = app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando em http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });
wss.on("connection", handleConnection);
