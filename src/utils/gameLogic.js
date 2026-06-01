const SUITS  = ['♠', '♥', '♦', '♣'];
const VALUES = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

/** 用 randomHex 從牌堆發 4 張牌（玩家2張、莊家2張） */
export const dealCards = (randomHex) => {
  const hex = randomHex.startsWith('0x') ? randomHex.slice(2) : randomHex;

  // 產生完整 52 張牌
  const deck = [];
  for (const suit of SUITS)
    for (const value of VALUES)
      deck.push({ suit, value });

  // 用 Hash 的不同字節做 Fisher-Yates 洗牌
  const shuffled = [...deck];
  for (let i = 51; i > 0; i--) {
    const byteIndex = i % (hex.length / 2);
    const byte = parseInt(hex.slice(byteIndex * 2, byteIndex * 2 + 2), 16);
    const j = byte % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return {
    playerHand: [shuffled[0], shuffled[2]],
    dealerHand:  [shuffled[1], shuffled[3]],
  };
};

/** 計算一手牌的點數（Ace 自動調整） */
export const calcScore = (hand) => {
  let total = 0, aces = 0;
  for (const card of hand) {
    if (card.value === 'A')                          { total += 11; aces++; }
    else if (['J','Q','K'].includes(card.value))     { total += 10; }
    else                                             { total += parseInt(card.value); }
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
};

/** 判定勝負，回傳 { winner: 'player'|'dealer'|'draw', reason } */
export const determineWinner = (playerHand, dealerHand) => {
  const ps = calcScore(playerHand);
  const ds = calcScore(dealerHand);
  if (ps > 21) return { winner: 'dealer', reason: '玩家爆牌' };
  if (ds > 21) return { winner: 'player', reason: '莊家爆牌' };
  if (ps > ds)  return { winner: 'player', reason: `${ps} 點 > ${ds} 點` };
  if (ds > ps)  return { winner: 'dealer', reason: `${ds} 點 > ${ps} 點` };
  return { winner: 'draw', reason: `平手 ${ps} 點` };
};

/** 儲存一局遊戲資料到 localStorage */
export const saveGame = (data) => {
  localStorage.setItem(`fairchain_${data.gameId}`, JSON.stringify(data));
  const list = JSON.parse(localStorage.getItem('fairchain_games') || '[]');
  list.unshift({ gameId: data.gameId, ts: data.timestamp });
  localStorage.setItem('fairchain_games', JSON.stringify(list.slice(0, 20)));
};

/** 讀取一局遊戲資料 */
export const loadGame = (gameId) => {
  const raw = localStorage.getItem(`fairchain_${gameId}`);
  return raw ? JSON.parse(raw) : null;
};

/** 讀取最近遊戲清單 */
export const recentGames = () =>
  JSON.parse(localStorage.getItem('fairchain_games') || '[]');