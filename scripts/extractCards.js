import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dimensões das cartas no SVG original (em mm)
const CARD_WIDTH = 64;
const CARD_HEIGHT = 89;
const TOTAL_WIDTH = 832;
const TOTAL_HEIGHT = 356;

// Mapeia as 52 cartas: 4 linhas x 13 cartas
// Linha 1 (y=0): Paus/Clubs (A-K)
// Linha 2 (y=89): Copas/Hearts (A-K)
// Linha 3 (y=178): Ouros/Diamonds (A-K)
// Linha 4 (y=267): Espadas/Spades (A-K)

const suits = [
  { name: "C", symbol: "♣", color: "black" }, // Clubs
  { name: "H", symbol: "♥", color: "red" }, // Hearts
  { name: "D", symbol: "♦", color: "red" }, // Diamonds
  { name: "S", symbol: "♠", color: "black" }, // Spades
];

const values = [
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

// Cria o mapeamento CSS para sprite sheet
function generateCSSMapping() {
  // Proporção exata: 64:89 do SVG
  // Usando 144px x 200px para manter proporção perfeita sem distorção
  const cardWidth = 144;
  const cardHeight = 200;

  let css = `/* Card Sprite Sheet Mapping */
.card-image {
  width: ${cardWidth}px;
  height: ${cardHeight}px;
  background-image: url('/src/PlayingCards.svg');
  background-size: ${(TOTAL_WIDTH / CARD_WIDTH) * cardWidth}px ${
    (TOTAL_HEIGHT / CARD_HEIGHT) * cardHeight
  }px;
  background-repeat: no-repeat;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

`;

  suits.forEach((suit, suitIndex) => {
    values.forEach((value, valueIndex) => {
      const x = valueIndex * CARD_WIDTH;
      const y = suitIndex * CARD_HEIGHT;

      // Calcula a posição do background
      const bgX = -(valueIndex * cardWidth);
      const bgY = -(suitIndex * cardHeight);

      css += `.card-image.card-${value}${suit.name} {
  background-position: ${bgX}px ${bgY}px;
}

`;
    });
  });

  return css;
}

// Cria o mapeamento JavaScript para o jogo
function generateJSMapping() {
  let js = `// Card mapping for game
const CARD_MAP = {
`;

  suits.forEach((suit, suitIndex) => {
    values.forEach((value, valueIndex) => {
      const cardId = `card-${value}${suit.name}`;
      js += `  '${value}${suit.symbol}': '${cardId}',\n`;
    });
  });

  js += `};

// Get card class from card object
function getCardClass(card) {
  const key = card.value + card.suit;
  return CARD_MAP[key] || 'card-back';
}

// Apply card image to element
function setCardImage(element, card) {
  element.className = 'card-image';
  const cardClass = getCardClass(card);
  if (cardClass !== 'card-back') {
    element.classList.add(cardClass);
  }
}

export { CARD_MAP, getCardClass, setCardImage };
`;

  return js;
}

// Cria os arquivos
const cssContent = generateCSSMapping();
const jsContent = generateJSMapping();

fs.writeFileSync(path.join(__dirname, "../public/game/cards.css"), cssContent);

fs.writeFileSync(
  path.join(__dirname, "../public/game/cardMapping.js"),
  jsContent
);

console.log("✅ Arquivos gerados com sucesso!");
console.log("📁 public/game/cards.css");
console.log("📁 public/game/cardMapping.js");
console.log("");
console.log("Total de cartas mapeadas: 52");
console.log("Naipes: ♣ ♥ ♦ ♠");
console.log("Valores: A 2 3 4 5 6 7 8 9 10 J Q K");
