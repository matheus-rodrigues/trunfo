// Card mapping for game
const CARD_MAP = {
  'A♣': 'card-AC',
  '2♣': 'card-2C',
  '3♣': 'card-3C',
  '4♣': 'card-4C',
  '5♣': 'card-5C',
  '6♣': 'card-6C',
  '7♣': 'card-7C',
  '8♣': 'card-8C',
  '9♣': 'card-9C',
  '10♣': 'card-10C',
  'J♣': 'card-JC',
  'Q♣': 'card-QC',
  'K♣': 'card-KC',
  'A♥': 'card-AH',
  '2♥': 'card-2H',
  '3♥': 'card-3H',
  '4♥': 'card-4H',
  '5♥': 'card-5H',
  '6♥': 'card-6H',
  '7♥': 'card-7H',
  '8♥': 'card-8H',
  '9♥': 'card-9H',
  '10♥': 'card-10H',
  'J♥': 'card-JH',
  'Q♥': 'card-QH',
  'K♥': 'card-KH',
  'A♦': 'card-AD',
  '2♦': 'card-2D',
  '3♦': 'card-3D',
  '4♦': 'card-4D',
  '5♦': 'card-5D',
  '6♦': 'card-6D',
  '7♦': 'card-7D',
  '8♦': 'card-8D',
  '9♦': 'card-9D',
  '10♦': 'card-10D',
  'J♦': 'card-JD',
  'Q♦': 'card-QD',
  'K♦': 'card-KD',
  'A♠': 'card-AS',
  '2♠': 'card-2S',
  '3♠': 'card-3S',
  '4♠': 'card-4S',
  '5♠': 'card-5S',
  '6♠': 'card-6S',
  '7♠': 'card-7S',
  '8♠': 'card-8S',
  '9♠': 'card-9S',
  '10♠': 'card-10S',
  'J♠': 'card-JS',
  'Q♠': 'card-QS',
  'K♠': 'card-KS',
};

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
