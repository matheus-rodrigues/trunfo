import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import {
  setupGameController,
  setupLobbyRoutes,
} from "./controllers/gameController.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

// Rotas para as páginas
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "home", "index.html"));
});

app.get("/game", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "game", "index.html"));
});

// Rotas de lobby (criação, pareamento, etc)
setupLobbyRoutes(app);

// Inicializa o controlador do jogo
setupGameController(io);

const PORT = 3000;
server.listen(PORT, () =>
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
);
