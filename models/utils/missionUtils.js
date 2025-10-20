// Missões classificadas por dificuldade
export const missionsByDifficulty = {
  easy: [
    {
      type: "pair",
      description: "Forme um par de cartas com o mesmo valor.",
      points: 3,
      difficulty: "easy",
    },
    {
      type: "flush",
      description: "Tenha 3 cartas do mesmo naipe no board.",
      points: 3,
      difficulty: "easy",
    },
    {
      type: "redcard",
      description: "Tenha 3 cartas vermelhas no board.",
      points: 3,
      difficulty: "easy",
    },
    {
      type: "blackcard",
      description: "Tenha 3 cartas pretas no board.",
      points: 3,
      difficulty: "easy",
    },
    {
      type: "rainbow3",
      description: "Tenha 3 cartas de naipes diferentes.",
      points: 2,
      difficulty: "easy",
    },
    {
      type: "low3",
      description: "Tenha 3 cartas com valor até 6.",
      points: 3,
      difficulty: "easy",
    },
    {
      type: "nopair",
      description: "Tenha 3 cartas com valores diferentes.",
      points: 2,
      difficulty: "easy",
    },
    {
      type: "onesuit",
      description: "Tenha 2 cartas do mesmo naipe.",
      points: 2,
      difficulty: "easy",
    },
    {
      type: "facecard",
      description: "Tenha 2 cartas de figura (J, Q, K).",
      points: 3,
      difficulty: "easy",
    },
    {
      type: "odd3",
      description: "Tenha 3 cartas de valor ímpar no board.",
      points: 3,
      difficulty: "easy",
    },
  ],
  medium: [
    {
      type: "trio",
      description: "Forme um trio de cartas com o mesmo valor.",
      points: 6,
      difficulty: "medium",
    },
    {
      type: "straight",
      description: "Tenha 3 cartas em sequência (ex: 5-6-7).",
      points: 6,
      difficulty: "medium",
    },
    {
      type: "twopair",
      description: "Forme dois pares diferentes no board.",
      points: 6,
      difficulty: "medium",
    },
    {
      type: "flush4",
      description: "Tenha 4 cartas do mesmo naipe no board.",
      points: 7,
      difficulty: "medium",
    },
    {
      type: "even",
      description: "Tenha 3 cartas de valor par no board.",
      points: 6,
      difficulty: "medium",
    },
    {
      type: "straight4",
      description: "Tenha 4 cartas em sequência.",
      points: 7,
      difficulty: "medium",
    },
    {
      type: "high3",
      description: "Tenha 3 cartas de valor alto (10 ou maior).",
      points: 5,
      difficulty: "medium",
    },
    {
      type: "foursuits",
      description: "Tenha 4 naipes diferentes presentes.",
      points: 5,
      difficulty: "medium",
    },
    {
      type: "distinct5",
      description: "Tenha 5 valores todos diferentes.",
      points: 8,
      difficulty: "medium",
    },
    {
      type: "colorbalance",
      description: "Tenha exatamente 2 vermelhas e 3 pretas (ou vice-versa).",
      points: 8,
      difficulty: "medium",
    },
    {
      type: "nokings",
      description: "Tenha 5 cartas sem nenhum Rei.",
      points: 5,
      difficulty: "medium",
    },
    {
      type: "allcourts",
      description: "Tenha 3 figuras (J, Q ou K).",
      points: 6,
      difficulty: "medium",
    },
    {
      type: "straight3gap",
      description: "Tenha 3 cartas em sequência pulando 1 (ex: 3-5-7).",
      points: 6,
      difficulty: "medium",
    },
    {
      type: "aceking",
      description: "Tenha um Ás e um Rei no board.",
      points: 5,
      difficulty: "medium",
    },
    {
      type: "mid3",
      description: "Tenha 3 cartas com valor entre 7 e 9.",
      points: 6,
      difficulty: "medium",
    },
    {
      type: "noaces",
      description: "Tenha 5 cartas sem nenhum Ás.",
      points: 5,
      difficulty: "medium",
    },
    {
      type: "twoflush",
      description: "Tenha dois pares de naipes (2 de um naipe + 2 de outro).",
      points: 7,
      difficulty: "medium",
    },
  ],
  hard: [
    {
      type: "fullhouse",
      description: "Forme um full house (um trio e um par) no board.",
      points: 15,
      difficulty: "hard",
    },
    {
      type: "straight5",
      description: "Tenha 5 cartas em sequência (ex: 2-3-4-5-6).",
      points: 11,
      difficulty: "hard",
    },
    {
      type: "flush5",
      description: "Tenha 5 cartas do mesmo naipe no board.",
      points: 11,
      difficulty: "hard",
    },
    {
      type: "quad",
      description: "Forme uma quadra (4 cartas do mesmo valor).",
      points: 18,
      difficulty: "hard",
    },
    {
      type: "alternate5",
      description: "Tenha 5 cartas alternando cores (vermelha/preta).",
      points: 13,
      difficulty: "hard",
    },
    {
      type: "straightflush",
      description: "Tenha 3 cartas em sequência do mesmo naipe.",
      points: 11,
      difficulty: "hard",
    },
    {
      type: "allodd",
      description: "Tenha 5 cartas todas com valor ímpar.",
      points: 11,
      difficulty: "hard",
    },
    {
      type: "alleven",
      description: "Tenha 5 cartas todas com valor par.",
      points: 11,
      difficulty: "hard",
    },
    {
      type: "royalcourt",
      description: "Tenha 4 figuras (J, Q, K) no board.",
      points: 12,
      difficulty: "hard",
    },
    {
      type: "norepeat",
      description: "Tenha 5 valores diferentes e 4 naipes diferentes.",
      points: 12,
      difficulty: "hard",
    },
  ],
};

// Sorteia uma missão de uma dificuldade
export function getRandomMissionByDifficulty(difficulty) {
  const arr = missionsByDifficulty[difficulty];
  const base = arr[Math.floor(Math.random() * arr.length)];
  // retorna cópia para evitar mutações acidentais
  return { ...base };
}

// Variante com exclusões por type
export function getRandomMissionByDifficultyExcluding(
  difficulty,
  excludeTypes = []
) {
  const poolAll = missionsByDifficulty[difficulty] || [];
  const pool = poolAll.filter((m) => !excludeTypes.includes(m.type));
  const source = pool.length ? pool : poolAll; // fallback se excluir tudo
  const base = source[Math.floor(Math.random() * source.length)];
  return { ...base };
}

// Sorteia 3 missões (1 fácil, 1 média, 1 difícil)
export function getInitialMissions(
  exclude = { easy: [], medium: [], hard: [] }
) {
  return [
    getRandomMissionByDifficultyExcluding("easy", exclude.easy || []),
    getRandomMissionByDifficultyExcluding("medium", exclude.medium || []),
    getRandomMissionByDifficultyExcluding("hard", exclude.hard || []),
  ];
}

// Sorteia nova missão da mesma dificuldade
export function getNewMissionOfSameDifficulty(mission) {
  // Utiliza campo difficulty diretamente, com fallback antigo por pontos
  let diff = mission.difficulty;
  if (!diff) {
    if (mission.points === 5) diff = "medium";
    else if (mission.points >= 9) diff = "hard";
    else diff = "easy";
  }
  let pool = missionsByDifficulty[diff] || missionsByDifficulty.easy;
  pool = pool.filter((m) => m.type !== mission.type);
  if (pool.length === 0) pool = missionsByDifficulty[diff];
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return { ...chosen };
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

  // Sequência de 4
  if (mission.type === "straight4") {
    if (cards.length < 4) return false;
    const sorted = cards
      .map((c) => cardValueToNumber(c.value))
      .sort((a, b) => a - b);
    for (let i = 0; i <= sorted.length - 4; i++) {
      if (
        sorted[i + 1] === sorted[i] + 1 &&
        sorted[i + 2] === sorted[i] + 2 &&
        sorted[i + 3] === sorted[i] + 3
      )
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

  // 3 cartas naipes diferentes (rainbow3)
  if (mission.type === "rainbow3") {
    if (cards.length < 3) return false;
    const suits = new Set(cards.map((c) => c.suit));
    return suits.size >= 3;
  }

  // 3 baixas (<=6) low3
  if (mission.type === "low3") {
    const low = cards.filter((c) => cardValueToNumber(c.value) <= 6);
    return low.length >= 3;
  }

  // 3 altas (>=10) high3
  if (mission.type === "high3") {
    const high = cards.filter((c) => cardValueToNumber(c.value) >= 10);
    return high.length >= 3;
  }

  // Quatro naipes presentes (foursuits)
  if (mission.type === "foursuits") {
    if (cards.length < 4) return false;
    const suits = new Set(cards.map((c) => c.suit));
    return suits.size === 4;
  }

  // 5 valores distintos (distinct5)
  if (mission.type === "distinct5") {
    if (cards.length < 5) return false;
    const values = new Set(cards.map((c) => c.value));
    return values.size === 5;
  }

  // Alternância de cores em 5 cartas (alternate5) requer board cheio
  if (mission.type === "alternate5") {
    if (cards.length < 5) return false;
    // Usa ordem real dos slots do board (não filtrada) para alternância
    if (board.length !== 5 || board.some((c) => !c)) return false;
    const colors = board.map((c) => c.color);
    const alt1 = colors.every((c, i) => i === 0 || c !== colors[i - 1]);
    // alt1 garante alternância; precisamos também evitar casos onde duas cores seguidas existem
    return alt1;
  }

  // Balanço de cores (colorbalance): exatamente 2 vermelhas e 3 pretas ou 3 vermelhas e 2 pretas
  if (mission.type === "colorbalance") {
    if (cards.length < 5) return false;
    const reds = cards.filter((c) => c.color === "red").length;
    const blacks = cards.filter((c) => c.color === "black").length;
    return (reds === 2 && blacks === 3) || (reds === 3 && blacks === 2);
  }

  // 3 cartas com valores diferentes (nopair - easy)
  if (mission.type === "nopair") {
    if (cards.length < 3) return false;
    const values = new Set(cards.map((c) => c.value));
    return values.size >= 3;
  }

  // 2 cartas do mesmo naipe (onesuit - easy)
  if (mission.type === "onesuit") {
    if (cards.length < 2) return false;
    const suits = {};
    cards.forEach((c) => {
      suits[c.suit] = (suits[c.suit] || 0) + 1;
    });
    return Object.values(suits).some((count) => count >= 2);
  }

  // 2 figuras J/Q/K (facecard - easy)
  if (mission.type === "facecard") {
    const faces = cards.filter((c) => ["J", "Q", "K"].includes(c.value));
    return faces.length >= 2;
  }

  // 3 cartas ímpares (odd3 - easy)
  if (mission.type === "odd3") {
    const odd = cards.filter((c) =>
      ["A", "3", "5", "7", "9", "J", "K"].includes(c.value)
    );
    return odd.length >= 3;
  }

  // 5 cartas sem Rei (nokings - medium)
  if (mission.type === "nokings") {
    if (cards.length < 5) return false;
    return !cards.some((c) => c.value === "K");
  }

  // 3 figuras J/Q/K (allcourts - medium)
  if (mission.type === "allcourts") {
    const courts = cards.filter((c) => ["J", "Q", "K"].includes(c.value));
    return courts.length >= 3;
  }

  // Sequência de 3 pulando 1 (straight3gap - medium, ex: 3-5-7)
  if (mission.type === "straight3gap") {
    if (cards.length < 3) return false;
    const sorted = cards
      .map((c) => cardValueToNumber(c.value))
      .sort((a, b) => a - b);
    for (let i = 0; i <= sorted.length - 3; i++) {
      if (sorted[i + 1] === sorted[i] + 2 && sorted[i + 2] === sorted[i] + 4)
        return true;
    }
    return false;
  }

  // Ás e Rei juntos (aceking - medium)
  if (mission.type === "aceking") {
    const hasAce = cards.some((c) => c.value === "A");
    const hasKing = cards.some((c) => c.value === "K");
    return hasAce && hasKing;
  }

  // 3 cartas valor 7-9 (mid3 - medium)
  if (mission.type === "mid3") {
    const mid = cards.filter((c) => ["7", "8", "9"].includes(c.value));
    return mid.length >= 3;
  }

  // 5 cartas sem Ás (noaces - medium)
  if (mission.type === "noaces") {
    if (cards.length < 5) return false;
    return !cards.some((c) => c.value === "A");
  }

  // Dois pares de naipes (twoflush - medium: 2 de um + 2 de outro)
  if (mission.type === "twoflush") {
    if (cards.length < 4) return false;
    const suits = {};
    cards.forEach((c) => {
      suits[c.suit] = (suits[c.suit] || 0) + 1;
    });
    const counts = Object.values(suits).filter((c) => c >= 2);
    return counts.length >= 2;
  }

  // Sequência flush de 3 (straightflush - hard)
  if (mission.type === "straightflush") {
    if (cards.length < 3) return false;
    // Agrupa por naipe
    const bySuit = {};
    cards.forEach((c) => {
      if (!bySuit[c.suit]) bySuit[c.suit] = [];
      bySuit[c.suit].push(cardValueToNumber(c.value));
    });
    // Verifica sequência em cada naipe
    for (const suit in bySuit) {
      const sorted = bySuit[suit].sort((a, b) => a - b);
      if (sorted.length < 3) continue;
      for (let i = 0; i <= sorted.length - 3; i++) {
        if (sorted[i + 1] === sorted[i] + 1 && sorted[i + 2] === sorted[i] + 2)
          return true;
      }
    }
    return false;
  }

  // 5 cartas todas ímpares (allodd - hard)
  if (mission.type === "allodd") {
    if (cards.length < 5) return false;
    return cards.every((c) =>
      ["A", "3", "5", "7", "9", "J", "K"].includes(c.value)
    );
  }

  // 5 cartas todas pares (alleven - hard)
  if (mission.type === "alleven") {
    if (cards.length < 5) return false;
    return cards.every((c) =>
      ["2", "4", "6", "8", "10", "Q"].includes(c.value)
    );
  }

  // 4 figuras (royalcourt - hard)
  if (mission.type === "royalcourt") {
    const courts = cards.filter((c) => ["J", "Q", "K"].includes(c.value));
    return courts.length >= 4;
  }

  // 5 valores diferentes e 4 naipes diferentes (norepeat - hard)
  if (mission.type === "norepeat") {
    if (cards.length < 5) return false;
    const values = new Set(cards.map((c) => c.value));
    const suits = new Set(cards.map((c) => c.suit));
    return values.size === 5 && suits.size === 4;
  }

  return false;
}
