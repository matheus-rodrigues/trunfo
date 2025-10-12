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
    if (Object.keys(this.players).length >= 2) return;

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
    };

    if (Object.keys(this.players).length === 2 && !this.currentTurn) {
      this.currentTurn = Object.keys(this.players)[0];
    }
  }

  removePlayer(id) {
    delete this.players[id];
    if (Object.keys(this.players).length === 0) this.reset();
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

            p.missions.splice(idx, 1);
            const newMission = {
              ...getNewMissionOfSameDifficulty(completedMission),
              completed: false,
            };
            p.missions.splice(idx, 0, newMission);

            if (checkMissionCompleted(this.board, newMission)) {
              const completedNewMission = { ...newMission, completed: true };
              p.points += completedNewMission.points;
              p.completedMissions.push(completedNewMission);
              p.missions.splice(idx, 1);
              const anotherMission = {
                ...getNewMissionOfSameDifficulty(completedNewMission),
                completed: false,
              };
              p.missions.splice(idx, 0, anotherMission);
              keepValidating = true;
            }

            keepValidating = true;
            break;
          }
        }
      }
    });

    if (!boardIsFull && this.board.every((c) => c !== null)) {
      const lastTwo = [];
      for (let i = this.board.length - 1; i >= 0 && lastTwo.length < 2; i--) {
        if (this.board[i]) lastTwo.unshift(i);
      }
      this.lockedSlots = lastTwo;
    } else if (boardIsFull) {
      this.lockedSlots.push(slotIndex);
      if (this.lockedSlots.length > 2) {
        this.lockedSlots.shift();
      }
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
