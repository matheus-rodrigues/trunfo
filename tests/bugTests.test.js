import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import { GameModel } from "../models/gameModel.js";
import { checkMissionCompleted } from "../models/utils/missionUtils.js";

describe("Bug Tests", () => {
  let game;

  beforeEach(() => {
    game = new GameModel();
    game.addPlayer("player1", "Alice");
    game.addPlayer("player2", "Bob");
  });

  describe("BUG (a): Locked slots with repeated overwrites", () => {
    test("should lock the slots of the last 2 moves, even if same slot played twice", () => {
      game.playCard("player1", 0, 0);
      game.playCard("player2", 0, 1);
      game.playCard("player1", 0, 2);
      game.playCard("player2", 0, 3);
      game.playCard("player1", 0, 4);

      const unlockedSlot = [0, 1, 2].find(
        (s) => !game.lockedSlots.includes(s)
      );
      game.playCard("player2", 0, unlockedSlot);
      game.playCard("player1", 0, unlockedSlot);

      assert.strictEqual(
        game.lockedSlots.length,
        2,
        "Should always have exactly 2 locked slots"
      );

      const expectedLocked = [unlockedSlot];
      const otherUnlocked = [0, 1, 2, 3, 4].find(
        (s) => !game.lockedSlots.includes(s) && s !== unlockedSlot
      );
      if (otherUnlocked !== undefined) {
        expectedLocked.push(otherUnlocked);
      }

      if (game.moveHistory.length >= 2) {
        const lastMove = game.moveHistory[game.moveHistory.length - 1];
        const secondLastMove = game.moveHistory[game.moveHistory.length - 2];
        
        if (lastMove === secondLastMove) {
          assert.strictEqual(
            game.lockedSlots.filter((s) => s === lastMove).length,
            1,
            "When same slot is played twice, should only lock it once"
          );
        }
      }
    });
  });

  describe("BUG (b): Alternate5 mission should check actual slot order 0-4", () => {
    test("should verify alternate5 checks slots in order, not filtered cards", () => {
      const board = [
        { value: "2", suit: "♥", color: "red" },
        { value: "5", suit: "♣", color: "black" },
        { value: "7", suit: "♦", color: "red" },
        { value: "9", suit: "♠", color: "black" },
        { value: "K", suit: "♥", color: "red" },
      ];
      const mission = {
        type: "alternate5",
        description: "Alternating colors",
        points: 13,
        difficulty: "hard",
      };
      assert.strictEqual(
        checkMissionCompleted(board, mission),
        true,
        "Should detect alternating colors in slot order"
      );
    });

    test("should fail alternate5 when colors don't alternate in slot order", () => {
      const board = [
        { value: "2", suit: "♥", color: "red" },
        { value: "5", suit: "♦", color: "red" },
        { value: "7", suit: "♣", color: "black" },
        { value: "9", suit: "♠", color: "black" },
        { value: "K", suit: "♥", color: "red" },
      ];
      const mission = {
        type: "alternate5",
        description: "Alternating colors",
        points: 13,
        difficulty: "hard",
      };
      assert.strictEqual(
        checkMissionCompleted(board, mission),
        false,
        "Should fail when colors don't alternate"
      );
    });
  });

  describe("BUG (c): Initial mission exclusion should prevent identical missions", () => {
    test("should not give both players identical missions (same type and difficulty)", () => {
      for (let i = 0; i < 10; i++) {
        const testGame = new GameModel();
        testGame.addPlayer("p1", "P1");
        testGame.addPlayer("p2", "P2");

        const p1Missions = testGame.players.p1.missions.map(
          (m) => `${m.type}-${m.difficulty}`
        );
        const p2Missions = testGame.players.p2.missions.map(
          (m) => `${m.type}-${m.difficulty}`
        );

        const commonMissions = p1Missions.filter((m) =>
          p2Missions.includes(m)
        );
        assert.strictEqual(
          commonMissions.length,
          0,
          `Players should not have any identical missions. Found: ${commonMissions.join(", ")}`
        );
      }
    });
  });

  describe("BUG (d): Mission replacement should not loop forever", () => {
    test("should handle instant completion of new mission without infinite loop", () => {
      game.board = [
        { value: "5", suit: "♥", color: "red" },
        { value: "5", suit: "♠", color: "black" },
        { value: "5", suit: "♣", color: "black" },
        { value: "7", suit: "♦", color: "red" },
        { value: "9", suit: "♥", color: "red" },
      ];

      game.players.player1.missions = [
        {
          type: "pair",
          description: "Test pair",
          points: 3,
          difficulty: "easy",
          completed: false,
        },
      ];

      const startTime = Date.now();
      game.players.player1.hand = [{ value: "2", suit: "♣", color: "black" }];
      
      const unlockedSlot = [0, 1, 2, 3, 4].find(
        (s) => !game.lockedSlots.includes(s)
      );
      if (unlockedSlot !== undefined) {
        game.currentTurn = "player1";
        game.playCard("player1", 0, unlockedSlot);
      }
      
      const elapsed = Date.now() - startTime;
      assert.ok(
        elapsed < 500,
        "Mission replacement should complete quickly (no infinite loop)"
      );

      assert.strictEqual(
        game.players.player1.missions.length,
        1,
        "Player should still have correct number of missions"
      );
    });

    test("should not assign a mission that is instantly completed on current board", () => {
      game.board = [
        { value: "2", suit: "♥", color: "red" },
        { value: "3", suit: "♠", color: "black" },
        { value: "4", suit: "♣", color: "black" },
        { value: "5", suit: "♦", color: "red" },
        { value: "6", suit: "♥", color: "red" },
      ];
      game.lockedSlots = [3, 4];

      const p1 = game.players.player1;
      p1.missions = [
        {
          type: "straight",
          description: "Straight of 3",
          points: 6,
          difficulty: "medium",
          completed: false,
        },
      ];
      p1.hand = [{ value: "9", suit: "♣", color: "black" }];

      game.currentTurn = "player1";
      game.playCard("player1", 0, 0);

      for (const mission of p1.missions) {
        const isCompleted = checkMissionCompleted(game.board, mission);
        assert.strictEqual(
          isCompleted,
          false,
          `New mission ${mission.type} should not be instantly completed`
        );
      }
    });
  });
});
