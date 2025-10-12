import express from "express";
import http from "http";
import { Server } from "socket.io";
import { setupGameController } from "./controllers/gameController.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// Inicializa o controlador do jogo
setupGameController(io);

const PORT = 3000;
server.listen(PORT, () =>
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
);
