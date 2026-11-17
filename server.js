import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { rateLimit } from "express-rate-limit";
import {
  setupGameController,
  setupLobbyRoutes,
} from "./controllers/gameController.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

// Rate limiting para API endpoints
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // máximo 30 requisições por minuto
  message: { error: "Muitas requisições, tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rotas para as páginas
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "home", "index.html"));
});

app.get("/game", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "game", "index.html"));
});

// Rotas de lobby (criação, pareamento, etc) com rate limiting
setupLobbyRoutes(app, apiLimiter);

// Inicializa o controlador do jogo
setupGameController(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
);
