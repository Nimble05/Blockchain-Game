const SUITS  = ['♠', '♥', '♦', '♣'];
const VALUES = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

// Seeded PRNG (xorshift) — deterministic, unbiased Fisher-Yates
function makePrng(hex) {
  const raw = hex.replace('0x', '');
  let s = (parseInt(raw.slice(0, 8), 16) ^ parseInt(raw.slice(8, 16), 16)) >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** 用 randomHex 建立一副確定性洗好的牌堆 */
export const createDeck = (randomHex) => {
  const rand = makePrng(randomHex);
  const deck = [];
  for (const suit of SUITS)
    for (const value of VALUES)
      deck.push({ suit, value });

  for (let i = 51; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

/** 相容舊版 Verifier：從牌堆取前 4 張分配 */
export const dealCards = (randomHex) => {
  const deck = createDeck(randomHex);
  return {
    playerHand: [deck[0], deck[2]],
    dealerHand:  [deck[1], deck[3]],
  };
};

/** 計算一手牌的點數（Ace 自動調整） */
export const calcScore = (hand) => {
  let total = 0, aces = 0;
  for (const card of hand) {
    if (card.value === 'A')                         { total += 11; aces++; }
    else if (['J','Q','K'].includes(card.value))    { total += 10; }
    else                                            { total += parseInt(card.value); }
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
  list.unshift({
    gameId: data.gameId,
    ts: data.timestamp,
    result: data.result?.winner,
  });
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
