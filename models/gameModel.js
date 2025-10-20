import { generateDeck } from "./utils/deckUtils.js";
import {
  getInitialMissions,
  getNewMissionOfSameDifficulty,
  checkMissionCompleted,
} from "./utils/missionUtils.js";

export class GameModel {
  constructor() {
    this.reset();
  }

  reset() {
    this.players = {};
    this.deck = generateDeck();
    this.board = Array(5).fill(null);
    this.currentTurn = null;
    this.lockedSlots = [];
    this.turnCount = 1;
    this.moveHistory = [];
    this.gameOver = false;
    this.winner = null;
  }

  drawCard(deck) {
    return deck.pop();
  }

  addPlayer(id, name = "Jogador") {
    if (Object.keys(this.players).length >= 2 && !this.players[id]) return;

    const playerName =
      name || `Jogador ${Object.keys(this.players).length + 1}`;

    // Se já existe, não sobrescreve (reconexão)
    if (!this.players[id]) {
      // Se já existe outro jogador, coletar tipos de missões dele para evitar duplicações iniciais
      const existingPlayerIds = Object.keys(this.players);
      let exclude = { easy: [], medium: [], hard: [] };
      if (existingPlayerIds.length === 1) {
        const other = this.players[existingPlayerIds[0]];
        if (other && Array.isArray(other.missions)) {
          other.missions.forEach((m) => {
            const diff =
              m.difficulty ||
              (m.points >= 9
                ? "hard"
                : m.points === 5 || m.points === 6
                ? "medium"
                : "easy");
            if (!exclude[diff].includes(m.type)) exclude[diff].push(m.type);
          });
        }
      }
      this.players[id] = {
        id,
        name: playerName,
        hand: [
          this.drawCard(this.deck),
          this.drawCard(this.deck),
          this.drawCard(this.deck),
          this.drawCard(this.deck),
        ],
        missions: getInitialMissions(exclude).map((m) => ({
          ...m,
          completed: false,
        })),
        completedMissions: [],
        points: 0,
        disconnected: false,
      };
    } else {
      // Se reconectou, marca como conectado e atualiza nome se necessário
      this.players[id].disconnected = false;
      if (playerName) {
        this.players[id].name = playerName;
      }
    }

    if (Object.keys(this.players).length === 2 && !this.currentTurn) {
      this.currentTurn = Object.keys(this.players)[0];
    }
  }

  removePlayer(id) {
    // Marca o jogador como desconectado, mas não remove seu estado
    if (this.players[id]) {
      this.players[id].disconnected = true;
    }
    // Só reseta se todos desconectarem
    const allDisconnected = Object.values(this.players).every(
      (p) => p.disconnected
    );
    if (allDisconnected) this.reset();
  }

  isReady() {
    return (
      Object.values(this.players || {}).filter((p) => p && !p.disconnected)
        .length === 2
    );
  }

  playCard(playerId, cardIndex, slotIndex) {
    if (this.gameOver) {
      return { error: "O jogo já terminou!" };
    }

    if (this.currentTurn !== playerId) {
      return { error: "Não é a sua vez!" };
    }

    if (!this.players[playerId] || !this.players[playerId].hand[cardIndex]) {
      return { error: "Carta inválida!" };
    }

    const boardIsFull = this.board.every((c) => c !== null);
    if (!boardIsFull && this.board[slotIndex]) {
      return { error: "Só pode sobrepor cartas quando o board estiver cheio!" };
    }

    if (boardIsFull && this.lockedSlots.includes(slotIndex)) {
      return { error: "Este slot está bloqueado!" };
    }

    const card = this.players[playerId].hand.splice(cardIndex, 1)[0];
    this.board[slotIndex] = card;

    if (!this.moveHistory) this.moveHistory = [];
    this.moveHistory.push(slotIndex);
    if (this.moveHistory.length > 20)
      this.moveHistory = this.moveHistory.slice(-20);

    const completedMissionsData = []; // Para rastrear missões completas

    Object.values(this.players).forEach((p) => {
      let keepValidating = true;
      while (keepValidating) {
        keepValidating = false;
        for (let idx = 0; idx < p.missions.length; idx++) {
          const mission = p.missions[idx];

          if (
            !mission.completed &&
            checkMissionCompleted(this.board, mission)
          ) {
            const completedMission = { ...mission, completed: true };
            p.points += completedMission.points;
            p.completedMissions.push(completedMission);

            // Adiciona dados da missão completa para notificação
            completedMissionsData.push({
              playerId: p.id,
              playerName: p.name,
              mission: completedMission,
              boardSnapshot: [...this.board], // Snapshot do board no momento
            });

            // Remove missão atual completada
            p.missions.splice(idx, 1);

            // Sorteia uma nova missão até que ela não esteja completa no board atual
            let newMission;
            do {
              newMission = {
                ...getNewMissionOfSameDifficulty(completedMission),
                completed: false,
              };
            } while (checkMissionCompleted(this.board, newMission));

            // Adiciona missão nova
            p.missions.splice(idx, 0, newMission);

            // Caso essa nova também se torne completa (por erro de lógica futura), continua validando
            keepValidating = true;
            break;
          }
        }
      }
    });

    if (!boardIsFull && this.board.every((c) => c !== null)) {
      // Board ficou cheio pela primeira vez
      const unique = [];
      for (
        let i = this.moveHistory.length - 1;
        i >= 0 && unique.length < 2;
        i--
      ) {
        const idx = this.moveHistory[i];
        if (!unique.includes(idx)) unique.unshift(idx);
      }
      this.lockedSlots = unique;
    } else if (boardIsFull) {
      const unique = [];
      for (
        let i = this.moveHistory.length - 1;
        i >= 0 && unique.length < 2;
        i--
      ) {
        const idx = this.moveHistory[i];
        if (!unique.includes(idx)) unique.unshift(idx);
      }
      this.lockedSlots = unique;
    }

    this.players[playerId].hand.push(this.drawCard(this.deck));
    this.turnCount = (this.turnCount || 0) + 1;

    // Verifica se algum jogador atingiu 50 pontos
    let gameOverData = null;
    for (const p of Object.values(this.players)) {
      if (p.points >= 50) {
        this.gameOver = true;
        this.winner = p;
        gameOverData = {
          winnerId: p.id,
          winnerName: p.name,
          winnerPoints: p.points,
          players: Object.values(this.players).map((player) => ({
            id: player.id,
            name: player.name,
            points: player.points,
          })),
        };
        break;
      }
    }

    const playerIds = Object.keys(this.players);
    const next = playerIds.find((id) => id !== playerId);
    this.currentTurn = next;

    return {
      success: true,
      completedMissions: completedMissionsData,
      gameOver: gameOverData,
    };
  }

  getState() {
    return {
      board: this.board,
      players: this.players,
      currentTurn: this.currentTurn,
      lockedSlots: this.lockedSlots,
      turnCount: this.turnCount,
      gameOver: this.gameOver,
      winner: this.winner,
    };
  }
}
