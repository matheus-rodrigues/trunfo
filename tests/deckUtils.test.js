import { test, describe } from "node:test";
import assert from "node:assert";
import { generateDeck } from "../models/utils/deckUtils.js";

describe("deckUtils", () => {
  describe("generateDeck", () => {
    test("should generate a deck with 52 cards", () => {
      const deck = generateDeck();
      assert.strictEqual(deck.length, 52);
    });

    test("should include all 4 suits", () => {
      const deck = generateDeck();
      const suits = new Set(deck.map((card) => card.suit));
      assert.strictEqual(suits.size, 4);
      assert.ok(suits.has("♣"));
      assert.ok(suits.has("♥"));
      assert.ok(suits.has("♦"));
      assert.ok(suits.has("♠"));
    });

    test("should include all 13 values", () => {
      const deck = generateDeck();
      const values = new Set(deck.map((card) => card.value));
      assert.strictEqual(values.size, 13);
      const expectedValues = [
        "A",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
      ];
      expectedValues.forEach((val) => {
        assert.ok(values.has(val));
      });
    });

    test("should have 13 cards of each suit", () => {
      const deck = generateDeck();
      const suitCounts = {};
      deck.forEach((card) => {
        suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
      });
      assert.strictEqual(suitCounts["♣"], 13);
      assert.strictEqual(suitCounts["♥"], 13);
      assert.strictEqual(suitCounts["♦"], 13);
      assert.strictEqual(suitCounts["♠"], 13);
    });

    test("should assign red color to hearts and diamonds", () => {
      const deck = generateDeck();
      const hearts = deck.filter((card) => card.suit === "♥");
      const diamonds = deck.filter((card) => card.suit === "♦");
      hearts.forEach((card) => {
        assert.strictEqual(card.color, "red");
      });
      diamonds.forEach((card) => {
        assert.strictEqual(card.color, "red");
      });
    });

    test("should assign black color to clubs and spades", () => {
      const deck = generateDeck();
      const clubs = deck.filter((card) => card.suit === "♣");
      const spades = deck.filter((card) => card.suit === "♠");
      clubs.forEach((card) => {
        assert.strictEqual(card.color, "black");
      });
      spades.forEach((card) => {
        assert.strictEqual(card.color, "black");
      });
    });

    test("should shuffle the deck (not in original order)", () => {
      const deck1 = generateDeck();
      const deck2 = generateDeck();
      const isSame = deck1.every(
        (card, i) =>
          card.value === deck2[i].value && card.suit === deck2[i].suit
      );
      assert.ok(!isSame, "Decks should be shuffled");
    });
  });
});
