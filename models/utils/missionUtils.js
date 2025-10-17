// Missões classificadas por dificuldade
export const missionsByDifficulty = {
  easy: [
    {
      type: "pair",
      description: "Forme um par de cartas com o mesmo valor.",
      points: 2,
    },
    {
      type: "flush",
      description: "Coloque 3 cartas do mesmo naipe no board.",
      points: 2,
    },
    {
      type: "redcard",
      description: "Coloque 3 cartas vermelhas no board.",
      points: 2,
    },
    {
      type: "blackcard",
      description: "Coloque 3 cartas pretas no board.",
      points: 2,
    },
  ],
  medium: [
    {
      type: "trio",
      description: "Forme um trio de cartas com o mesmo valor.",
      points: 5,
    },
    {
      type: "straight",
      description: "Coloque 3 cartas em sequência (ex: 5-6-7).",
      points: 5,
    },
    {
      type: "twopair",
      description: "Forme dois pares diferentes no board.",
      points: 5,
    },
    {
      type: "flush4",
      description: "Coloque 4 cartas do mesmo naipe no board.",
      points: 5,
    },
    {
      type: "even",
      description: "Coloque 3 cartas de valor par no board.",
      points: 5,
    },
  ],
  hard: [
    {
      type: "fullhouse",
      description: "Forme um full house (um trio e um par) no board.",
      points: 10,
    },
    {
      type: "straight5",
      description: "Coloque 5 cartas em sequência (ex: 2-3-4-5-6).",
      points: 10,
    },
    {
      type: "flush5",
      description: "Coloque 5 cartas do mesmo naipe no board.",
      points: 10,
    },
    {
      type: "quad",
      description: "Forme uma quadra (4 cartas do mesmo valor) no board.",
      points: 10,
    },
  ],
};

// Sorteia uma missão de uma dificuldade
export function getRandomMissionByDifficulty(difficulty) {
  const arr = missionsByDifficulty[difficulty];
  return arr[Math.floor(Math.random() * arr.length)];
}

// Sorteia 3 missões (1 fácil, 1 média, 1 difícil)
export function getInitialMissions() {
  return [
    getRandomMissionByDifficulty("easy"),
    getRandomMissionByDifficulty("medium"),
    getRandomMissionByDifficulty("hard"),
  ];
}

// Sorteia nova missão da mesma dificuldade
export function getNewMissionOfSameDifficulty(mission) {
  let diff = "easy";
  if (mission.points === 5) diff = "medium";
  if (mission.points === 10) diff = "hard";
  // Evita repetir a mesma missão
  let arr = missionsByDifficulty[diff].filter((m) => m.type !== mission.type);
  if (arr.length === 0) arr = missionsByDifficulty[diff];
  return arr[Math.floor(Math.random() * arr.length)];
}

// Converte valor textual para número (A pode valer 14)
function cardValueToNumber(value) {
  const map = { A: 14, J: 11, Q: 12, K: 13 };
  return map[value] || parseInt(value);
}

// Verifica se há um flush com no mínimo X cartas do mesmo naipe
function hasFlush(cards, count) {
  const suits = {};
  cards.forEach((c) => {
    if (!c) return;
    suits[c.suit] = (suits[c.suit] || 0) + 1;
  });
  return Object.values(suits).some((s) => s >= count);
}

export function checkMissionCompleted(board, mission) {
  const cards = board.filter(Boolean);

  // Par
  if (mission.type === "pair") {
    if (cards.length < 2) return false;
    const valueCount = {};
    cards.forEach((c) => {
      valueCount[c.value] = (valueCount[c.value] || 0) + 1;
    });
    return Object.values(valueCount).some((count) => count >= 2);
  }

  // Dois pares
  if (mission.type === "twopair") {
    if (cards.length < 4) return false;
    const valueCount = {};
    cards.forEach((c) => {
      valueCount[c.value] = (valueCount[c.value] || 0) + 1;
    });
    return Object.values(valueCount).filter((count) => count >= 2).length >= 2;
  }

  // Trio
  if (mission.type === "trio") {
    if (cards.length < 3) return false;
    const valueCount = {};
    cards.forEach((c) => {
      valueCount[c.value] = (valueCount[c.value] || 0) + 1;
    });
    return Object.values(valueCount).some((count) => count >= 3);
  }

  // Quadra
  if (mission.type === "quad") {
    if (cards.length < 4) return false;
    const valueCount = {};
    cards.forEach((c) => {
      valueCount[c.value] = (valueCount[c.value] || 0) + 1;
    });
    return Object.values(valueCount).some((count) => count >= 4);
  }

  // Flush (3, 4 ou 5 cartas do mesmo naipe)
  if (["flush", "flush4", "flush5"].includes(mission.type)) {
    const minCount =
      mission.type === "flush" ? 3 : mission.type === "flush4" ? 4 : 5;
    return hasFlush(cards, minCount);
  }

  // Full House
  if (mission.type === "fullhouse") {
    if (cards.length < 5) return false;
    const valueCount = {};
    cards.forEach((c) => {
      valueCount[c.value] = (valueCount[c.value] || 0) + 1;
    });
    const counts = Object.values(valueCount).sort((a, b) => b - a);
    return counts[0] >= 3 && counts[1] >= 2;
  }

  // Sequência de 3
  if (mission.type === "straight") {
    if (cards.length < 3) return false;
    const sorted = cards
      .map((c) => cardValueToNumber(c.value))
      .sort((a, b) => a - b);
    for (let i = 0; i <= sorted.length - 3; i++) {
      if (sorted[i + 1] === sorted[i] + 1 && sorted[i + 2] === sorted[i] + 2)
        return true;
    }
    return false;
  }

  // Sequência de 5
  if (mission.type === "straight5") {
    if (cards.length < 5) return false;
    const sorted = cards
      .map((c) => cardValueToNumber(c.value))
      .sort((a, b) => a - b);
    for (let i = 0; i <= sorted.length - 5; i++) {
      if (
        sorted[i + 1] === sorted[i] + 1 &&
        sorted[i + 2] === sorted[i] + 2 &&
        sorted[i + 3] === sorted[i] + 3 &&
        sorted[i + 4] === sorted[i] + 4
      )
        return true;
    }
    return false;
  }
  // 3 cartas vermelhas
  if (mission.type === "redcard") {
    return cards.filter((c) => c.color === "red").length >= 3;
  }

  // 3 cartas pretas
  if (mission.type === "blackcard") {
    return cards.filter((c) => c.color === "black").length >= 3;
  }

  // 3 cartas pares
  if (mission.type === "even") {
    return (
      cards.filter((c) => ["2", "4", "6", "8", "10", "Q"].includes(c.value))
        .length >= 3
    );
  }

  return false;
}
