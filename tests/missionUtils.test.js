import { test, describe } from "node:test";
import assert from "node:assert";
import {
  checkMissionCompleted,
  getInitialMissions,
  getNewMissionOfSameDifficulty,
  getRandomMissionByDifficulty,
  missionsByDifficulty,
} from "../models/utils/missionUtils.js";

describe("missionUtils", () => {
  describe("checkMissionCompleted - Easy Missions", () => {
    describe("pair", () => {
      test("should return true when board has a pair", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "5", suit: "♠", color: "black" },
          { value: "7", suit: "♣", color: "black" },
          null,
          null,
        ];
        const mission = { type: "pair", difficulty: "easy", points: 3 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has no pairs", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♠", color: "black" },
          { value: "9", suit: "♣", color: "black" },
          null,
          null,
        ];
        const mission = { type: "pair", difficulty: "easy", points: 3 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("flush", () => {
      test("should return true when board has 3+ cards of same suit", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♥", color: "red" },
          { value: "9", suit: "♥", color: "red" },
          null,
          null,
        ];
        const mission = { type: "flush", difficulty: "easy", points: 3 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 3 cards of same suit", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♥", color: "red" },
          { value: "9", suit: "♣", color: "black" },
          null,
          null,
        ];
        const mission = { type: "flush", difficulty: "easy", points: 3 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("redcard", () => {
      test("should return true when board has 3+ red cards", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♦", color: "red" },
          { value: "9", suit: "♥", color: "red" },
          null,
          null,
        ];
        const mission = { type: "redcard", difficulty: "easy", points: 3 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 3 red cards", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♦", color: "red" },
          { value: "9", suit: "♣", color: "black" },
          null,
          null,
        ];
        const mission = { type: "redcard", difficulty: "easy", points: 3 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("blackcard", () => {
      test("should return true when board has 3+ black cards", () => {
        const board = [
          { value: "5", suit: "♠", color: "black" },
          { value: "7", suit: "♣", color: "black" },
          { value: "9", suit: "♠", color: "black" },
          null,
          null,
        ];
        const mission = { type: "blackcard", difficulty: "easy", points: 3 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 3 black cards", () => {
        const board = [
          { value: "5", suit: "♠", color: "black" },
          { value: "7", suit: "♣", color: "black" },
          { value: "9", suit: "♥", color: "red" },
          null,
          null,
        ];
        const mission = { type: "blackcard", difficulty: "easy", points: 3 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("rainbow3", () => {
      test("should return true when board has 3 different suits", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♣", color: "black" },
          { value: "9", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = { type: "rainbow3", difficulty: "easy", points: 2 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 3 different suits", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♥", color: "red" },
          { value: "9", suit: "♥", color: "red" },
          null,
          null,
        ];
        const mission = { type: "rainbow3", difficulty: "easy", points: 2 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("low3", () => {
      test("should return true when board has 3+ cards with value <= 6", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          { value: "6", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = { type: "low3", difficulty: "easy", points: 3 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 3 cards with value <= 6", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          { value: "10", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = { type: "low3", difficulty: "easy", points: 3 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("nopair", () => {
      test("should return true when board has 3+ different values", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          { value: "9", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = { type: "nopair", difficulty: "easy", points: 2 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 3 different values", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "2", suit: "♣", color: "black" },
          null,
          null,
          null,
        ];
        const mission = { type: "nopair", difficulty: "easy", points: 2 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("onesuit", () => {
      test("should return true when board has 2+ cards of same suit", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♥", color: "red" },
          null,
          null,
          null,
        ];
        const mission = { type: "onesuit", difficulty: "easy", points: 2 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has no pairs of suits", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          null,
          null,
          null,
          null,
        ];
        const mission = { type: "onesuit", difficulty: "easy", points: 2 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("facecard", () => {
      test("should return true when board has 2+ face cards", () => {
        const board = [
          { value: "J", suit: "♥", color: "red" },
          { value: "K", suit: "♣", color: "black" },
          null,
          null,
          null,
        ];
        const mission = { type: "facecard", difficulty: "easy", points: 3 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 2 face cards", () => {
        const board = [
          { value: "J", suit: "♥", color: "red" },
          { value: "2", suit: "♣", color: "black" },
          null,
          null,
          null,
        ];
        const mission = { type: "facecard", difficulty: "easy", points: 3 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("odd3", () => {
      test("should return true when board has 3+ odd cards", () => {
        const board = [
          { value: "3", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = { type: "odd3", difficulty: "easy", points: 3 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 3 odd cards", () => {
        const board = [
          { value: "3", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          { value: "2", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = { type: "odd3", difficulty: "easy", points: 3 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });
  });

  describe("checkMissionCompleted - Medium Missions", () => {
    describe("trio", () => {
      test("should return true when board has a trio", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "5", suit: "♠", color: "black" },
          { value: "5", suit: "♣", color: "black" },
          null,
          null,
        ];
        const mission = { type: "trio", difficulty: "medium", points: 6 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has no trio", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "5", suit: "♠", color: "black" },
          { value: "7", suit: "♣", color: "black" },
          null,
          null,
        ];
        const mission = { type: "trio", difficulty: "medium", points: 6 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("straight", () => {
      test("should return true when board has 3 cards in sequence", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "6", suit: "♠", color: "black" },
          { value: "7", suit: "♣", color: "black" },
          null,
          null,
        ];
        const mission = { type: "straight", difficulty: "medium", points: 6 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has no sequence of 3", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♠", color: "black" },
          { value: "9", suit: "♣", color: "black" },
          null,
          null,
        ];
        const mission = { type: "straight", difficulty: "medium", points: 6 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("twopair", () => {
      test("should return true when board has two pairs", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "5", suit: "♠", color: "black" },
          { value: "7", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          null,
        ];
        const mission = { type: "twopair", difficulty: "medium", points: 6 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has only one pair", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "5", suit: "♠", color: "black" },
          { value: "7", suit: "♣", color: "black" },
          { value: "9", suit: "♦", color: "red" },
          null,
        ];
        const mission = { type: "twopair", difficulty: "medium", points: 6 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("flush4", () => {
      test("should return true when board has 4+ cards of same suit", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♥", color: "red" },
          { value: "9", suit: "♥", color: "red" },
          null,
        ];
        const mission = { type: "flush4", difficulty: "medium", points: 7 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 4 cards of same suit", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♥", color: "red" },
          { value: "9", suit: "♣", color: "black" },
          null,
        ];
        const mission = { type: "flush4", difficulty: "medium", points: 7 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("even", () => {
      test("should return true when board has 3+ even cards", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "4", suit: "♣", color: "black" },
          { value: "6", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = { type: "even", difficulty: "medium", points: 6 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 3 even cards", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "4", suit: "♣", color: "black" },
          { value: "5", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = { type: "even", difficulty: "medium", points: 6 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("straight4", () => {
      test("should return true when board has 4 cards in sequence", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "6", suit: "♠", color: "black" },
          { value: "7", suit: "♣", color: "black" },
          { value: "8", suit: "♦", color: "red" },
          null,
        ];
        const mission = { type: "straight4", difficulty: "medium", points: 7 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has no sequence of 4", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "6", suit: "♠", color: "black" },
          { value: "7", suit: "♣", color: "black" },
          { value: "9", suit: "♦", color: "red" },
          null,
        ];
        const mission = { type: "straight4", difficulty: "medium", points: 7 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("high3", () => {
      test("should return true when board has 3+ cards with value >= 10", () => {
        const board = [
          { value: "10", suit: "♥", color: "red" },
          { value: "J", suit: "♣", color: "black" },
          { value: "K", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = { type: "high3", difficulty: "medium", points: 5 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 3 cards with value >= 10", () => {
        const board = [
          { value: "10", suit: "♥", color: "red" },
          { value: "J", suit: "♣", color: "black" },
          { value: "5", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = { type: "high3", difficulty: "medium", points: 5 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("foursuits", () => {
      test("should return true when board has 4 different suits", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          { value: "9", suit: "♠", color: "black" },
          null,
        ];
        const mission = {
          type: "foursuits",
          difficulty: "medium",
          points: 5,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 4 different suits", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♦", color: "red" },
          { value: "9", suit: "♦", color: "red" },
          null,
        ];
        const mission = {
          type: "foursuits",
          difficulty: "medium",
          points: 5,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("distinct5", () => {
      test("should return true when board has 5 different values", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          { value: "9", suit: "♠", color: "black" },
          { value: "K", suit: "♥", color: "red" },
        ];
        const mission = {
          type: "distinct5",
          difficulty: "medium",
          points: 8,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has duplicate values", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "2", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          { value: "9", suit: "♠", color: "black" },
          { value: "K", suit: "♥", color: "red" },
        ];
        const mission = {
          type: "distinct5",
          difficulty: "medium",
          points: 8,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("colorbalance", () => {
      test("should return true when board has 2 red and 3 black", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♦", color: "red" },
          { value: "7", suit: "♣", color: "black" },
          { value: "9", suit: "♠", color: "black" },
          { value: "K", suit: "♣", color: "black" },
        ];
        const mission = {
          type: "colorbalance",
          difficulty: "medium",
          points: 8,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return true when board has 3 red and 2 black", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♦", color: "red" },
          { value: "7", suit: "♥", color: "red" },
          { value: "9", suit: "♠", color: "black" },
          { value: "K", suit: "♣", color: "black" },
        ];
        const mission = {
          type: "colorbalance",
          difficulty: "medium",
          points: 8,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has unbalanced colors", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♦", color: "red" },
          { value: "7", suit: "♥", color: "red" },
          { value: "9", suit: "♦", color: "red" },
          { value: "K", suit: "♣", color: "black" },
        ];
        const mission = {
          type: "colorbalance",
          difficulty: "medium",
          points: 8,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("nokings", () => {
      test("should return true when board has 5 cards with no kings", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          { value: "9", suit: "♠", color: "black" },
          { value: "J", suit: "♥", color: "red" },
        ];
        const mission = { type: "nokings", difficulty: "medium", points: 5 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has a king", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          { value: "9", suit: "♠", color: "black" },
          { value: "K", suit: "♥", color: "red" },
        ];
        const mission = { type: "nokings", difficulty: "medium", points: 5 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("allcourts", () => {
      test("should return true when board has 3+ face cards", () => {
        const board = [
          { value: "J", suit: "♥", color: "red" },
          { value: "Q", suit: "♣", color: "black" },
          { value: "K", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = {
          type: "allcourts",
          difficulty: "medium",
          points: 6,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 3 face cards", () => {
        const board = [
          { value: "J", suit: "♥", color: "red" },
          { value: "Q", suit: "♣", color: "black" },
          { value: "2", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = {
          type: "allcourts",
          difficulty: "medium",
          points: 6,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("straight3gap", () => {
      test("should return true when board has 3 cards in sequence with gap of 2", () => {
        const board = [
          { value: "3", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = {
          type: "straight3gap",
          difficulty: "medium",
          points: 6,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has no gapped sequence", () => {
        const board = [
          { value: "3", suit: "♥", color: "red" },
          { value: "4", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = {
          type: "straight3gap",
          difficulty: "medium",
          points: 6,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("aceking", () => {
      test("should return true when board has an Ace and a King", () => {
        const board = [
          { value: "A", suit: "♥", color: "red" },
          { value: "K", suit: "♣", color: "black" },
          null,
          null,
          null,
        ];
        const mission = { type: "aceking", difficulty: "medium", points: 5 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has only an Ace", () => {
        const board = [
          { value: "A", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          null,
          null,
          null,
        ];
        const mission = { type: "aceking", difficulty: "medium", points: 5 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });

      test("should return false when board has only a King", () => {
        const board = [
          { value: "K", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          null,
          null,
          null,
        ];
        const mission = { type: "aceking", difficulty: "medium", points: 5 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("mid3", () => {
      test("should return true when board has 3+ cards with value 7-9", () => {
        const board = [
          { value: "7", suit: "♥", color: "red" },
          { value: "8", suit: "♣", color: "black" },
          { value: "9", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = { type: "mid3", difficulty: "medium", points: 6 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 3 cards with value 7-9", () => {
        const board = [
          { value: "7", suit: "♥", color: "red" },
          { value: "8", suit: "♣", color: "black" },
          { value: "5", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = { type: "mid3", difficulty: "medium", points: 6 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("noaces", () => {
      test("should return true when board has 5 cards with no aces", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          { value: "9", suit: "♠", color: "black" },
          { value: "K", suit: "♥", color: "red" },
        ];
        const mission = { type: "noaces", difficulty: "medium", points: 5 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has an ace", () => {
        const board = [
          { value: "A", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          { value: "9", suit: "♠", color: "black" },
          { value: "K", suit: "♥", color: "red" },
        ];
        const mission = { type: "noaces", difficulty: "medium", points: 5 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("twoflush", () => {
      test("should return true when board has 2+ cards of two different suits", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♣", color: "black" },
          { value: "9", suit: "♣", color: "black" },
          null,
        ];
        const mission = { type: "twoflush", difficulty: "medium", points: 7 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 2 pairs of suits", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♣", color: "black" },
          { value: "9", suit: "♦", color: "red" },
          null,
        ];
        const mission = { type: "twoflush", difficulty: "medium", points: 7 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });
  });

  describe("checkMissionCompleted - Hard Missions", () => {
    describe("fullhouse", () => {
      test("should return true when board has full house (trio + pair)", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "5", suit: "♠", color: "black" },
          { value: "5", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          { value: "7", suit: "♥", color: "red" },
        ];
        const mission = {
          type: "fullhouse",
          difficulty: "hard",
          points: 15,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has only trio", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "5", suit: "♠", color: "black" },
          { value: "5", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          { value: "9", suit: "♥", color: "red" },
        ];
        const mission = {
          type: "fullhouse",
          difficulty: "hard",
          points: 15,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("straight5", () => {
      test("should return true when board has 5 cards in sequence", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "3", suit: "♠", color: "black" },
          { value: "4", suit: "♣", color: "black" },
          { value: "5", suit: "♦", color: "red" },
          { value: "6", suit: "♥", color: "red" },
        ];
        const mission = {
          type: "straight5",
          difficulty: "hard",
          points: 11,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has no sequence of 5", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "3", suit: "♠", color: "black" },
          { value: "4", suit: "♣", color: "black" },
          { value: "5", suit: "♦", color: "red" },
          { value: "9", suit: "♥", color: "red" },
        ];
        const mission = {
          type: "straight5",
          difficulty: "hard",
          points: 11,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("flush5", () => {
      test("should return true when board has 5 cards of same suit", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♥", color: "red" },
          { value: "9", suit: "♥", color: "red" },
          { value: "K", suit: "♥", color: "red" },
        ];
        const mission = { type: "flush5", difficulty: "hard", points: 11 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 5 cards of same suit", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♥", color: "red" },
          { value: "9", suit: "♥", color: "red" },
          { value: "K", suit: "♣", color: "black" },
        ];
        const mission = { type: "flush5", difficulty: "hard", points: 11 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("quad", () => {
      test("should return true when board has 4 cards of same value", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "5", suit: "♠", color: "black" },
          { value: "5", suit: "♣", color: "black" },
          { value: "5", suit: "♦", color: "red" },
          null,
        ];
        const mission = { type: "quad", difficulty: "hard", points: 18 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has only trio", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "5", suit: "♠", color: "black" },
          { value: "5", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          null,
        ];
        const mission = { type: "quad", difficulty: "hard", points: 18 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("alternate5", () => {
      test("should return true when board has alternating colors", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          { value: "9", suit: "♠", color: "black" },
          { value: "K", suit: "♥", color: "red" },
        ];
        const mission = {
          type: "alternate5",
          difficulty: "hard",
          points: 13,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has consecutive same colors", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♦", color: "red" },
          { value: "7", suit: "♣", color: "black" },
          { value: "9", suit: "♠", color: "black" },
          { value: "K", suit: "♥", color: "red" },
        ];
        const mission = {
          type: "alternate5",
          difficulty: "hard",
          points: 13,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("straightflush", () => {
      test("should return true when board has 3 cards in sequence of same suit", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "6", suit: "♥", color: "red" },
          { value: "7", suit: "♥", color: "red" },
          null,
          null,
        ];
        const mission = {
          type: "straightflush",
          difficulty: "hard",
          points: 11,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has sequence but different suits", () => {
        const board = [
          { value: "5", suit: "♥", color: "red" },
          { value: "6", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          null,
          null,
        ];
        const mission = {
          type: "straightflush",
          difficulty: "hard",
          points: 11,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("allodd", () => {
      test("should return true when board has 5 odd cards", () => {
        const board = [
          { value: "A", suit: "♥", color: "red" },
          { value: "3", suit: "♣", color: "black" },
          { value: "5", suit: "♦", color: "red" },
          { value: "7", suit: "♠", color: "black" },
          { value: "9", suit: "♥", color: "red" },
        ];
        const mission = { type: "allodd", difficulty: "hard", points: 11 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has an even card", () => {
        const board = [
          { value: "A", suit: "♥", color: "red" },
          { value: "3", suit: "♣", color: "black" },
          { value: "5", suit: "♦", color: "red" },
          { value: "7", suit: "♠", color: "black" },
          { value: "2", suit: "♥", color: "red" },
        ];
        const mission = { type: "allodd", difficulty: "hard", points: 11 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("alleven", () => {
      test("should return true when board has 5 even cards", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "4", suit: "♣", color: "black" },
          { value: "6", suit: "♦", color: "red" },
          { value: "8", suit: "♠", color: "black" },
          { value: "10", suit: "♥", color: "red" },
        ];
        const mission = { type: "alleven", difficulty: "hard", points: 11 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has an odd card", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "4", suit: "♣", color: "black" },
          { value: "6", suit: "♦", color: "red" },
          { value: "8", suit: "♠", color: "black" },
          { value: "3", suit: "♥", color: "red" },
        ];
        const mission = { type: "alleven", difficulty: "hard", points: 11 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("royalcourt", () => {
      test("should return true when board has 4+ face cards", () => {
        const board = [
          { value: "J", suit: "♥", color: "red" },
          { value: "Q", suit: "♣", color: "black" },
          { value: "K", suit: "♦", color: "red" },
          { value: "J", suit: "♠", color: "black" },
          null,
        ];
        const mission = {
          type: "royalcourt",
          difficulty: "hard",
          points: 12,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has less than 4 face cards", () => {
        const board = [
          { value: "J", suit: "♥", color: "red" },
          { value: "Q", suit: "♣", color: "black" },
          { value: "K", suit: "♦", color: "red" },
          { value: "2", suit: "♠", color: "black" },
          null,
        ];
        const mission = {
          type: "royalcourt",
          difficulty: "hard",
          points: 12,
        };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });

    describe("norepeat", () => {
      test("should return true when board has 5 different values and 4 suits", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          { value: "9", suit: "♠", color: "black" },
          { value: "K", suit: "♥", color: "red" },
        ];
        const mission = { type: "norepeat", difficulty: "hard", points: 12 };
        assert.strictEqual(checkMissionCompleted(board, mission), true);
      });

      test("should return false when board has duplicate values", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "2", suit: "♣", color: "black" },
          { value: "7", suit: "♦", color: "red" },
          { value: "9", suit: "♠", color: "black" },
          { value: "K", suit: "♥", color: "red" },
        ];
        const mission = { type: "norepeat", difficulty: "hard", points: 12 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });

      test("should return false when board has less than 4 suits", () => {
        const board = [
          { value: "2", suit: "♥", color: "red" },
          { value: "5", suit: "♥", color: "red" },
          { value: "7", suit: "♦", color: "red" },
          { value: "9", suit: "♦", color: "red" },
          { value: "K", suit: "♥", color: "red" },
        ];
        const mission = { type: "norepeat", difficulty: "hard", points: 12 };
        assert.strictEqual(checkMissionCompleted(board, mission), false);
      });
    });
  });

  describe("getInitialMissions", () => {
    test("should return 3 missions (easy, medium, hard)", () => {
      const missions = getInitialMissions();
      assert.strictEqual(missions.length, 3);
      assert.strictEqual(missions[0].difficulty, "easy");
      assert.strictEqual(missions[1].difficulty, "medium");
      assert.strictEqual(missions[2].difficulty, "hard");
    });

    test("should exclude mission types when provided", () => {
      const exclude = { easy: ["pair"], medium: ["trio"], hard: ["quad"] };
      for (let i = 0; i < 10; i++) {
        const missions = getInitialMissions(exclude);
        assert.notStrictEqual(missions[0].type, "pair");
        assert.notStrictEqual(missions[1].type, "trio");
        assert.notStrictEqual(missions[2].type, "quad");
      }
    });
  });

  describe("getNewMissionOfSameDifficulty", () => {
    test("should return a mission of the same difficulty", () => {
      const oldMission = { type: "pair", difficulty: "easy", points: 3 };
      const newMission = getNewMissionOfSameDifficulty(oldMission);
      assert.strictEqual(newMission.difficulty, "easy");
    });

    test("should not return the same mission type", () => {
      const oldMission = { type: "pair", difficulty: "easy", points: 3 };
      for (let i = 0; i < 10; i++) {
        const newMission = getNewMissionOfSameDifficulty(oldMission);
        if (newMission.type !== "pair") {
          return;
        }
      }
      assert.fail(
        "Should have returned a different mission type in 10 attempts"
      );
    });
  });

  describe("getRandomMissionByDifficulty", () => {
    test("should return mission of specified difficulty", () => {
      const mission = getRandomMissionByDifficulty("medium");
      assert.strictEqual(mission.difficulty, "medium");
    });

    test("should return different missions on multiple calls", () => {
      const missions = new Set();
      for (let i = 0; i < 20; i++) {
        missions.add(getRandomMissionByDifficulty("easy").type);
      }
      assert.ok(
        missions.size > 1,
        "Should return different missions over multiple calls"
      );
    });
  });
});
