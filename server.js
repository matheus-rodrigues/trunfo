import express from "express";
import http from "http";
import { Server } from "socket.io";
import { setupGame } from "./controllers/gameController.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

setupGame(io);

server.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
