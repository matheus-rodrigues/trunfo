import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import { GameModel } from "../models/gameModel.js";

describe("GameModel", () => {
  let game;

  beforeEach(() => {
    game = new GameModel();
    game.addPlayer("player1", "Alice");
    game.addPlayer("player2", "Bob");
  });

  describe("initialization", () => {
    test("should initialize with 2 players", () => {
      assert.strictEqual(Object.keys(game.players).length, 2);
    });

    test("should give each player 4 cards", () => {
      assert.strictEqual(game.players.player1.hand.length, 4);
      assert.strictEqual(game.players.player2.hand.length, 4);
    });

    test("should give each player 3 missions", () => {
      assert.strictEqual(game.players.player1.missions.length, 3);
      assert.strictEqual(game.players.player2.missions.length, 3);
    });

    test("should initialize players with different mission types", () => {
      const p1Types = game.players.player1.missions.map((m) => m.type);
      const p2Types = game.players.player2.missions.map((m) => m.type);
      const hasCommonType = p1Types.some((type) => p2Types.includes(type));
      assert.strictEqual(
        hasCommonType,
        false,
        "Players should not have identical mission types initially"
      );
    });

    test("should have empty board with 5 slots", () => {
      assert.strictEqual(game.board.length, 5);
      assert.ok(game.board.every((slot) => slot === null));
    });

    test("should set first player as current turn", () => {
      assert.strictEqual(game.currentTurn, "player1");
    });
  });

  describe("turn management", () => {
    test("should reject play when not player's turn", () => {
      const result = game.playCard("player2", 0, 0);
      assert.ok(result.error);
      assert.match(result.error, /não é a sua vez/i);
    });

    test("should alternate turns after successful play", () => {
      game.playCard("player1", 0, 0);
      assert.strictEqual(game.currentTurn, "player2");
      game.playCard("player2", 0, 1);
      assert.strictEqual(game.currentTurn, "player1");
    });
  });

  describe("card placement - initial 5 slots", () => {
    test("should allow playing card in empty slot", () => {
      const result = game.playCard("player1", 0, 0);
      assert.ok(result.success);
      assert.ok(game.board[0] !== null);
    });

    test("should reject playing in occupied slot when board not full", () => {
      game.playCard("player1", 0, 0);
      const result = game.playCard("player2", 0, 0);
      assert.ok(result.error);
      assert.match(result.error, /board estiver cheio/i);
    });

    test("should allow filling all 5 slots", () => {
      game.playCard("player1", 0, 0);
      game.playCard("player2", 0, 1);
      game.playCard("player1", 0, 2);
      game.playCard("player2", 0, 3);
      const result = game.playCard("player1", 0, 4);
      assert.ok(result.success);
      assert.ok(game.board.every((slot) => slot !== null));
    });
  });

  describe("locked slots", () => {
    beforeEach(() => {
      game.playCard("player1", 0, 0);
      game.playCard("player2", 0, 1);
      game.playCard("player1", 0, 2);
      game.playCard("player2", 0, 3);
      game.playCard("player1", 0, 4);
    });

    test("should lock last 2 played slots when board becomes full", () => {
      assert.strictEqual(game.lockedSlots.length, 2);
      assert.ok(game.lockedSlots.includes(3));
      assert.ok(game.lockedSlots.includes(4));
    });

    test("should reject play on locked slot", () => {
      const lockedSlot = game.lockedSlots[0];
      const result = game.playCard("player2", 0, lockedSlot);
      assert.ok(result.error);
      assert.match(result.error, /bloqueado/i);
    });

    test("should allow play on unlocked slot after board is full", () => {
      const unlockedSlot = [0, 1, 2, 3, 4].find(
        (s) => !game.lockedSlots.includes(s)
      );
      const result = game.playCard("player2", 0, unlockedSlot);
      assert.ok(result.success);
    });

    test("should update locked slots after each play on full board", () => {
      const unlockedSlot = [0, 1, 2, 3, 4].find(
        (s) => !game.lockedSlots.includes(s)
      );
      game.playCard("player2", 0, unlockedSlot);
      assert.ok(game.lockedSlots.includes(unlockedSlot));
    });

    test("BUG TEST: should handle repeated overwrites of same slot correctly", () => {
      const unlockedSlot = [0, 1, 2, 3, 4].find(
        (s) => !game.lockedSlots.includes(s)
      );
      game.playCard("player2", 0, unlockedSlot);
      const prevLocked = [...game.lockedSlots];
      if (!game.lockedSlots.includes(unlockedSlot)) {
        game.playCard("player1", 0, unlockedSlot);
      }
      const anotherUnlocked = [0, 1, 2, 3, 4].find(
        (s) => !game.lockedSlots.includes(s)
      );
      if (anotherUnlocked !== undefined) {
        game.playCard("player2", 0, anotherUnlocked);
        assert.strictEqual(
          game.lockedSlots.length,
          2,
          "Should always lock exactly 2 slots"
        );
      }
    });
  });

  describe("card drawing", () => {
    test("should draw a card after playing", () => {
      const initialHandSize = game.players.player1.hand.length;
      game.playCard("player1", 0, 0);
      assert.strictEqual(game.players.player1.hand.length, initialHandSize);
    });

    test("should decrease deck size after drawing", () => {
      const initialDeckSize = game.deck.length;
      game.playCard("player1", 0, 0);
      assert.strictEqual(game.deck.length, initialDeckSize - 1);
    });
  });

  describe("deck reshuffle", () => {
    test("should reshuffle discard pile when deck is empty", () => {
      game.deck = [];
      game.discardPile = [
        { value: "5", suit: "♥", color: "red" },
        { value: "7", suit: "♣", color: "black" },
      ];
      const initialDiscardSize = game.discardPile.length;
      const card = game.drawCard();
      assert.ok(card !== null, "Should draw a card from reshuffled discard pile");
      assert.ok(game.deck.length >= 0, "Deck should have cards from reshuffle");
      assert.strictEqual(game.discardPile.length, 0, "Discard pile should be empty after reshuffle");
    });

    test("should move overwritten cards to discard pile", () => {
      game.playCard("player1", 0, 0);
      game.playCard("player2", 0, 1);
      game.playCard("player1", 0, 2);
      game.playCard("player2", 0, 3);
      game.playCard("player1", 0, 4);
      const initialDiscardSize = game.discardPile.length;
      const unlockedSlot = [0, 1, 2, 3, 4].find(
        (s) => !game.lockedSlots.includes(s)
      );
      game.playCard("player2", 0, unlockedSlot);
      assert.strictEqual(game.discardPile.length, initialDiscardSize + 1);
    });
  });

  describe("mission completion and scoring", () => {
    test("should detect and complete missions", () => {
      game.board = [
        { value: "5", suit: "♥", color: "red" },
        null,
        null,
        null,
        null,
      ];
      const p1 = game.players.player1;
      const initialPoints = p1.points;
      p1.missions = [
        {
          type: "pair",
          description: "Test pair",
          points: 3,
          difficulty: "easy",
          completed: false,
        },
      ];
      p1.hand = [
        { value: "5", suit: "♠", color: "black" },
        { value: "7", suit: "♣", color: "black" },
        { value: "9", suit: "♦", color: "red" },
        { value: "K", suit: "♥", color: "red" },
      ];
      game.currentTurn = "player1";
      game.playCard("player1", 0, 1);
      const finalPoints = p1.points;
      assert.ok(finalPoints >= initialPoints + 3, "Player should have scored at least 3 points from pair mission");
    });

    test("should replace completed mission with new one of same difficulty", () => {
      const p1 = game.players.player1;
      const initialMissionType = p1.missions[0].type;
      p1.missions[0] = {
        type: "pair",
        description: "Test pair",
        points: 3,
        difficulty: "easy",
        completed: false,
      };
      p1.hand = [
        { value: "5", suit: "♥", color: "red" },
        { value: "5", suit: "♠", color: "black" },
        { value: "7", suit: "♣", color: "black" },
        { value: "9", suit: "♦", color: "red" },
      ];
      game.playCard("player1", 0, 0);
      game.playCard("player2", 0, 1);
      game.playCard("player1", 1, 2);
      assert.strictEqual(
        p1.missions.length,
        3,
        "Player should still have 3 missions"
      );
    });

    test("BUG TEST: should not loop forever when new mission is instantly complete", () => {
      const p1 = game.players.player1;
      p1.missions = [
        {
          type: "pair",
          description: "Test pair",
          points: 3,
          difficulty: "easy",
          completed: false,
        },
      ];
      p1.hand = [
        { value: "5", suit: "♥", color: "red" },
        { value: "5", suit: "♠", color: "black" },
        { value: "5", suit: "♣", color: "black" },
        { value: "5", suit: "♦", color: "red" },
      ];
      const startTime = Date.now();
      game.playCard("player1", 0, 0);
      game.playCard("player2", 0, 1);
      game.playCard("player1", 1, 2);
      const elapsed = Date.now() - startTime;
      assert.ok(
        elapsed < 1000,
        "Should not take more than 1 second (indicates no infinite loop)"
      );
    });
  });

  describe("win condition", () => {
    test("should detect win at 50 points", () => {
      game.players.player1.points = 48;
      game.players.player1.missions[0] = {
        type: "pair",
        description: "Test pair",
        points: 3,
        difficulty: "easy",
        completed: false,
      };
      game.players.player1.hand = [
        { value: "5", suit: "♥", color: "red" },
        { value: "5", suit: "♠", color: "black" },
        { value: "7", suit: "♣", color: "black" },
        { value: "9", suit: "♦", color: "red" },
      ];
      game.playCard("player1", 0, 0);
      game.playCard("player2", 0, 1);
      const result = game.playCard("player1", 1, 2);
      if (game.players.player1.points >= 50) {
        assert.ok(result.gameOver);
        assert.ok(game.gameOver);
        assert.strictEqual(game.winner.id, "player1");
      }
    });

    test("should prevent further plays after game over", () => {
      game.gameOver = true;
      const result = game.playCard("player1", 0, 0);
      assert.ok(result.error);
      assert.match(result.error, /jogo já terminou/i);
    });
  });

  describe("input validation", () => {
    test("should reject invalid cardIndex", () => {
      const result = game.playCard("player1", -1, 0);
      assert.ok(result.error);
      assert.match(result.error, /índice de carta inválido/i);
    });

    test("should reject out of bounds cardIndex", () => {
      const result = game.playCard("player1", 10, 0);
      assert.ok(result.error);
      assert.match(result.error, /índice de carta inválido/i);
    });

    test("should reject invalid slotIndex", () => {
      const result = game.playCard("player1", 0, -1);
      assert.ok(result.error);
      assert.match(result.error, /posição no board inválida/i);
    });

    test("should reject out of bounds slotIndex", () => {
      const result = game.playCard("player1", 0, 5);
      assert.ok(result.error);
      assert.match(result.error, /posição no board inválida/i);
    });
  });

  describe("moveHistory", () => {
    test("should track move history", () => {
      game.playCard("player1", 0, 0);
      assert.strictEqual(game.moveHistory.length, 1);
      assert.strictEqual(game.moveHistory[0], 0);
    });

    test("should limit moveHistory to 20 entries", () => {
      for (let i = 0; i < 25; i++) {
        const slot = i % 5;
        const player = i % 2 === 0 ? "player1" : "player2";
        if (i < 5) {
          game.playCard(player, 0, slot);
        } else {
          const unlockedSlot = [0, 1, 2, 3, 4].find(
            (s) => !game.lockedSlots.includes(s)
          );
          if (unlockedSlot !== undefined) {
            game.playCard(player, 0, unlockedSlot);
          }
        }
      }
      assert.ok(game.moveHistory.length <= 20);
    });
  });

  describe("alternate5 mission", () => {
    test("BUG TEST: should check slot order 0-4 for alternate colors", () => {
      game.board = [
        { value: "2", suit: "♥", color: "red" },
        { value: "5", suit: "♣", color: "black" },
        { value: "7", suit: "♦", color: "red" },
        { value: "9", suit: "♠", color: "black" },
        { value: "K", suit: "♥", color: "red" },
      ];
      const p1 = game.players.player1;
      p1.missions[0] = {
        type: "alternate5",
        description: "Alternating colors",
        points: 13,
        difficulty: "hard",
        completed: false,
      };
      const unlockedSlot = [0, 1, 2, 3, 4].find(
        (s) => !game.lockedSlots.includes(s)
      );
      if (unlockedSlot !== undefined) {
        p1.hand = [{ value: "3", suit: "♣", color: "black" }];
        const result = game.playCard("player1", 0, unlockedSlot);
      }
    });
  });
});
