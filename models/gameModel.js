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
  }

  drawCard(deck) {
    return deck.pop();
  }

  addPlayer(id) {
    if (Object.keys(this.players).length >= 2 && !this.players[id]) return;

    // Se já existe, não sobrescreve (reconexão)
    if (!this.players[id]) {
      this.players[id] = {
        id,
        hand: [
          this.drawCard(this.deck),
          this.drawCard(this.deck),
          this.drawCard(this.deck),
          this.drawCard(this.deck),
        ],
        missions: getInitialMissions().map((m) => ({ ...m, completed: false })),
        completedMissions: [],
        points: 0,
        disconnected: false,
      };
    } else {
      // Se reconectou, marca como conectado
      this.players[id].disconnected = false;
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
    return Object.keys(this.players).length === 2;
  }

  playCard(playerId, cardIndex, slotIndex) {
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

    Object.values(this.players).forEach((p) => {
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
    });

    if (!boardIsFull && this.board.every((c) => c !== null)) {
      // Board ficou cheio pela primeira vez
      if (!this.moveHistory) this.moveHistory = [];
      this.moveHistory.push(slotIndex);
      // Bloqueia a última e a penúltima carta jogada
      let lastTwo;
      if (this.moveHistory.length >= 2) {
        lastTwo = this.moveHistory.slice(-2);
      } else if (this.moveHistory.length === 1) {
        // Se só tem uma jogada, bloqueia ela e a anterior no board
        const prev = this.board.findIndex((c, idx) => idx !== this.moveHistory[0] && c !== null);
        lastTwo = [prev, this.moveHistory[0]];
      } else {
        lastTwo = [];
      }
      this.lockedSlots = lastTwo;
    } else if (boardIsFull) {
      if (!this.moveHistory) this.moveHistory = [];
      this.moveHistory.push(slotIndex);
      // Atualiza lockedSlots para as duas últimas jogadas sempre que o board estiver cheio
      this.lockedSlots = this.moveHistory.slice(-2);
    }

    this.players[playerId].hand.push(this.drawCard(this.deck));
    this.turnCount = (this.turnCount || 0) + 1;

    const playerIds = Object.keys(this.players);
    const next = playerIds.find((id) => id !== playerId);
    this.currentTurn = next;

    return { success: true };
  }

  getState() {
    return {
      board: this.board,
      players: this.players,
      currentTurn: this.currentTurn,
      lockedSlots: this.lockedSlots,
      turnCount: this.turnCount,
    };
  }
}
