#!/usr/bin/env node

import { io as ioClient } from "socket.io-client";
import http from "http";

const SERVER_URL = "http://localhost:3000";
let player1Socket, player2Socket;
let testsPassed = 0;
let testsFailed = 0;

function log(message) {
  console.log(`[SMOKE TEST] ${message}`);
}

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    log(`✓ ${message}`);
  } else {
    testsFailed++;
    log(`✗ ${message}`);
  }
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function httpPost(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: "localhost",
      port: 3000,
      path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function runSmokeTest() {
  log("Starting 2-player socket smoke test...");

  try {
    // Step 1: Create room for player 1
    log("Creating room for player 1...");
    const p1Data = await httpPost("/api/create-room", {
      playerName: "Player1",
    });
    assert(p1Data.roomCode, "Received room code");
    assert(p1Data.playerId, "Received player 1 ID");
    assert(p1Data.sessionToken, "Received player 1 session token");

    const { roomCode, playerId: p1Id, sessionToken: p1Token } = p1Data;
    log(`Room created: ${roomCode}`);

    // Step 2: Player 2 joins the room
    log("Player 2 joining room...");
    const p2Data = await httpPost("/api/join-room", {
      playerName: "Player2",
      roomCode,
    });
    assert(p2Data.playerId, "Received player 2 ID");
    assert(p2Data.sessionToken, "Received player 2 session token");
    const { playerId: p2Id, sessionToken: p2Token } = p2Data;

    // Set up event listeners first
    let player1State = null;
    let player2State = null;
    let currentTurn = null;

    // Step 3: Connect player 1 via socket
    log("Connecting player 1 socket...");
    const p1Connected = new Promise((resolve) => {
      player1Socket = ioClient(SERVER_URL, {
        transports: ["websocket"],
        auth: {
          playerId: p1Id,
          sessionToken: p1Token,
          playerName: "Player1",
          roomCode,
        },
      });
      player1Socket.on("connect", () => {
        log("Player 1 socket connected");
        resolve();
      });
      player1Socket.on("state", (state) => {
        player1State = state;
        currentTurn = state.currentTurn;
      });
      player1Socket.on("errorMessage", (msg) => {
        log(`Player 1 error: ${msg}`);
      });
    });
    await p1Connected;

    // Step 4: Connect player 2 via socket
    log("Connecting player 2 socket...");
    const p2Connected = new Promise((resolve) => {
      player2Socket = ioClient(SERVER_URL, {
        transports: ["websocket"],
        auth: {
          playerId: p2Id,
          sessionToken: p2Token,
          playerName: "Player2",
          roomCode,
        },
      });
      player2Socket.on("connect", () => {
        log("Player 2 socket connected");
        resolve();
      });
      player2Socket.on("state", (state) => {
        player2State = state;
        currentTurn = state.currentTurn;
      });
      player2Socket.on("errorMessage", (msg) => {
        log(`Player 2 error: ${msg}`);
      });
    });
    await p2Connected;

    log("Both players connected");

    // Wait for game to initialize
    await delay(1000);

    assert(player1State !== null, "Player 1 received initial game state");
    assert(player2State !== null, "Player 2 received initial game state");
    assert(player1State?.board?.length === 5, "Board has 5 slots");
    assert(
      Object.keys(player1State?.players || {}).length === 2,
      "Game has 2 players"
    );

    // Check player hands and missions
    assert(
      player1State?.players[p1Id]?.hand?.length === 4,
      "Player 1 has 4 cards"
    );
    assert(
      player1State?.players[p1Id]?.missions?.length === 3,
      "Player 1 has 3 missions"
    );
    assert(
      player2State?.players[p2Id]?.hand?.length === 4,
      "Player 2 has 4 cards"
    );
    assert(
      player2State?.players[p2Id]?.missions?.length === 3,
      "Player 2 has 3 missions"
    );

    log("Initial state validated, attempting to play cards...");

    // Player plays a card
    const firstPlayerId = currentTurn;
    const firstSocket = currentTurn === p1Id ? player1Socket : player2Socket;
    firstSocket.emit("playCard", { cardIndex: 0, slotIndex: 0 });
    await delay(700);
    
    assert(
      player1State?.board[0] !== null,
      "First card successfully played to slot 0"
    );
    
    const newTurn = firstPlayerId === p1Id ? p2Id : p1Id;
    assert(player1State.currentTurn === newTurn, "Turn switched to other player");

    // Play a few more turns
    for (let i = 0; i < 3; i++) {
      const activeSocket = player1State.currentTurn === p1Id ? player1Socket : player2Socket;
      const slotIndex = i + 1;
      activeSocket.emit("playCard", { cardIndex: 0, slotIndex });
      await delay(700);
    }

    const finalState = player1State;
    const cardsPlayed = finalState.board.filter((c) => c !== null).length;
    assert(cardsPlayed === 4, `Board has ${cardsPlayed} cards after 4 plays`);

    log("\n=== Smoke Test Results ===");
    log(`Tests passed: ${testsPassed}`);
    log(`Tests failed: ${testsFailed}`);

    if (testsFailed === 0) {
      log("✓ All smoke tests passed!");
      process.exit(0);
    } else {
      log("✗ Some smoke tests failed");
      process.exit(1);
    }
  } catch (error) {
    log(`Error during smoke test: ${error.message}`);
    process.exit(1);
  } finally {
    if (player1Socket) player1Socket.disconnect();
    if (player2Socket) player2Socket.disconnect();
  }
}

// Run the test
runSmokeTest().catch((error) => {
  log(`Fatal error: ${error.message}`);
  process.exit(1);
});
