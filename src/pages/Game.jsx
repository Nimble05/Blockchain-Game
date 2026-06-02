import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PlayingCard from '../components/PlayingCard';
import StepBar     from '../components/StepBar';
import {
  generateSeed, hashSeed, combineSeeds,
  shortenHash, mockTxHash,
} from '../utils/crypto';
import {
  dealCards, calcScore, determineWinner, saveGame,
} from '../utils/gameLogic';

/* ── 小型可重用 UI 元件 ─────────────────────── */

function HashBox({ label, value, reveal }) {
  return (
    <div className="bg-gray-950 border border-gray-700 rounded-xl p-3 space-y-1">
      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</div>
      {reveal
        ? <div className="font-mono text-xs text-emerald-400 break-all">{value}</div>
        : <div className="font-mono text-xs text-gray-600">{'█'.repeat(32)} (隱藏)</div>
      }
    </div>
  );
}

function CheckRow({ label, ok }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={ok ? 'text-emerald-400' : 'text-red-400'}>{ok ? '✅' : '❌'}</span>
      <span className="text-gray-400">{label}</span>
    </div>
  );
}

function Loader({ text }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <span key={i} className="dot w-3 h-3 bg-indigo-500 rounded-full" />
        ))}
      </div>
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  );
}

/* ── 主元件 ────────────────────────────────── */

export default function Game() {
  const { id: roomId } = useParams();
  const navigate       = useNavigate();

  // 種子（永遠不重新生成，用 useState 惰性初始化）
  const [playerSeed] = useState(() => generateSeed());
  const [dealerSeed] = useState(() => generateSeed());
  const playerHash   = hashSeed(playerSeed);
  const dealerHash   = hashSeed(dealerSeed);

  const [phase,    setPhase]    = useState('commit');   // commit | reveal | result
  const [loading,  setLoading]  = useState(false);
  const [loadMsg,  setLoadMsg]  = useState('');
  const [txHash]                = useState(() => mockTxHash());
  const [gameId]                = useState(() => roomId || `game_${Date.now()}`);

  // Result data
  const [finalRandom, setFinalRandom] = useState('');
  const [playerHand,  setPlayerHand]  = useState([]);
  const [dealerHand,  setDealerHand]  = useState([]);
  const [result,      setResult]      = useState(null);

  const simulate = async (msg, ms = 1600) => {
    setLoading(true);
    setLoadMsg(msg);
    await new Promise(r => setTimeout(r, ms));
    setLoading(false);
  };

  /* 承諾 → 揭露 */
  const handleCommit = async () => {
    await simulate('📡 正在將 Hash 寫入區塊鏈…');
    setPhase('reveal');
  };

  /* 揭露 → 結果 */
  const handleReveal = async () => {
    await simulate('🔐 驗證雜湊值並計算最終隨機數…');

    const combined = combineSeeds(playerSeed, dealerSeed);
    setFinalRandom(combined);

    const { playerHand: ph, dealerHand: dh } = dealCards(combined);
    setPlayerHand(ph);
    setDealerHand(dh);

    const res = determineWinner(ph, dh);
    setResult(res);
    setPhase('result');

    // 儲存供驗證器使用
    saveGame({
      gameId,
      playerSeed, dealerSeed,
      playerHash, dealerHash,
      finalRandom: combined,
      playerHand: ph,
      dealerHand: dh,
      result: res,
      txHash,
      timestamp: new Date().toISOString(),
    });
  };

  /* ── Commit Phase ─── */
  const CommitPhase = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">承諾階段</h2>
        <p className="text-gray-400 mt-1 text-sm">
          雙方種子的雜湊值將被永久寫入區塊鏈，任何人都無法在事後偷換
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* 玩家 */}
        <div className="bg-gray-900 border border-indigo-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧑</span>
            <span className="font-bold text-white">玩家（你）</span>
            <span className="ml-auto text-xs bg-indigo-950 border border-indigo-700
                             text-indigo-300 rounded-full px-2 py-0.5">你的角色</span>
          </div>
          <HashBox label="明文種子（保密）" value={playerSeed} reveal={true} />
          <HashBox label="提交至鏈上的 Hash" value={playerHash} reveal={true} />
          <p className="text-xs text-gray-600">
            ✦ 種子由你的瀏覽器隨機生成，莊家完全看不到
          </p>
        </div>

        {/* 莊家 */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏦</span>
            <span className="font-bold text-white">莊家（系統）</span>
          </div>
          <HashBox label="明文種子（隱藏）" value={dealerSeed} reveal={false} />
          <HashBox label="提交至鏈上的 Hash" value={dealerHash} reveal={true} />
          <p className="text-xs text-gray-600">
            ✦ 莊家種子此時已鎖定，揭露前你無法得知其內容
          </p>
        </div>
      </div>

      {/* TX 預覽 */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm
                      font-mono space-y-1">
        <div className="text-gray-500 text-xs mb-2">即將寫入的區塊鏈交易</div>
        <div className="text-gray-400">tx_hash: <span className="text-indigo-400">{shortenHash(txHash)}</span></div>
        <div className="text-gray-400">network: <span className="text-gray-300">Arbitrum Sepolia</span></div>
        <div className="text-gray-400">data: commit(player_hash, dealer_hash)</div>
      </div>

      <button
        onClick={handleCommit}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold
                   rounded-2xl py-4 text-lg transition-all hover:scale-[1.02]
                   shadow-lg shadow-indigo-950"
      >
        🔒 提交承諾至區塊鏈
      </button>
    </div>
  );

  /* ── Reveal Phase ─── */
  const RevealPhase = () => {
    const p_ok = hashSeed(playerSeed) === playerHash;
    const d_ok = hashSeed(dealerSeed) === dealerHash;

    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">揭露階段</h2>
          <p className="text-gray-400 mt-1 text-sm">
            雙方公開明文種子，系統自動驗證與鏈上承諾是否一致
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* 玩家揭露 */}
          <div className="bg-gray-900 border border-emerald-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧑</span>
              <span className="font-bold text-white">玩家</span>
              <span className="ml-auto text-xs text-emerald-400">✅ 已揭露</span>
            </div>
            <HashBox label="明文種子" value={playerSeed} reveal={true} />
            <HashBox label="原始承諾 Hash" value={playerHash} reveal={true} />
            <CheckRow
              label={`keccak256(seed) === 承諾 Hash → ${p_ok ? '吻合' : '不吻合'}`}
              ok={p_ok}
            />
          </div>

          {/* 莊家揭露 */}
          <div className="bg-gray-900 border border-emerald-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏦</span>
              <span className="font-bold text-white">莊家</span>
              <span className="ml-auto text-xs text-emerald-400">✅ 已揭露</span>
            </div>
            <HashBox label="明文種子（現在公開）" value={dealerSeed} reveal={true} />
            <HashBox label="原始承諾 Hash" value={dealerHash} reveal={true} />
            <CheckRow
              label={`keccak256(seed) === 承諾 Hash → ${d_ok ? '吻合' : '不吻合'}`}
              ok={d_ok}
            />
          </div>
        </div>

        {/* 最終隨機數計算說明 */}
        <div className="bg-indigo-950/40 border border-indigo-800 rounded-2xl p-5 space-y-3">
          <div className="text-sm font-bold text-indigo-300">🎲 最終隨機數計算方式</div>
          <div className="font-mono text-xs text-gray-400 space-y-1">
            <div>final_random = <span className="text-indigo-400">keccak256</span>(
              playerSeed <span className="text-gray-600">||</span> dealerSeed
            )</div>
            <div className="text-gray-600">— 任何一方都無法單獨控制此結果</div>
            <div className="text-gray-600">— 雙方必須都誠實揭露，結果才能計算</div>
          </div>
        </div>

        <button
          onClick={handleReveal}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold
                     rounded-2xl py-4 text-lg transition-all hover:scale-[1.02]
                     shadow-lg shadow-emerald-950"
        >
          🎴 發牌並計算結果
        </button>
      </div>
    );
  };

  /* ── Result Phase ─── */
  const ResultPhase = () => {
    const ps = calcScore(playerHand);
    const ds = calcScore(dealerHand);
    const isPlayerWin = result?.winner === 'player';
    const isDraw      = result?.winner === 'draw';

    return (
      <div className="space-y-6 animate-fade-in-up">
        {/* Winner banner */}
        <div className={`rounded-2xl border p-5 text-center
          ${isPlayerWin ? 'bg-emerald-950/50 border-emerald-700' : ''}
          ${isDraw      ? 'bg-gray-800/50 border-gray-700'       : ''}
          ${!isPlayerWin && !isDraw ? 'bg-red-950/50 border-red-800' : ''}`}>
          <div className="text-4xl mb-2">
            {isPlayerWin ? '🏆' : isDraw ? '🤝' : '😞'}
          </div>
          <div className="text-2xl font-extrabold text-white">
            {isPlayerWin ? '玩家獲勝！'
              : isDraw  ? '平手'
              : '莊家獲勝'}
          </div>
          <div className={`text-sm mt-1
            ${isPlayerWin ? 'text-emerald-400' : isDraw ? 'text-gray-400' : 'text-red-400'}`}>
            {result?.reason}
          </div>
        </div>

        {/* Game board */}
        <div className="bg-emerald-950 border border-emerald-900 rounded-2xl p-6 space-y-6">
          <div className="text-center text-xs text-emerald-700 tracking-widest uppercase font-bold">
            ── 牌桌 ──
          </div>

          {/* Dealer hand */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300 font-medium">🏦 莊家</span>
              <span className={`font-bold ${ds > 21 ? 'text-red-400' : 'text-white'}`}>
                {ds} 點{ds > 21 ? ' 💥爆牌' : ''}
              </span>
            </div>
            <div className="flex gap-3">
              {dealerHand.map((card, i) => (
                <PlayingCard key={i} suit={card.suit} value={card.value} size="lg" />
              ))}
            </div>
          </div>

          <div className="border-t border-emerald-900" />

          {/* Player hand */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300 font-medium">🧑 玩家</span>
              <span className={`font-bold ${ps > 21 ? 'text-red-400' : 'text-white'}`}>
                {ps} 點{ps > 21 ? ' 💥爆牌' : ''}
              </span>
            </div>
            <div className="flex gap-3">
              {playerHand.map((card, i) => (
                <PlayingCard key={i} suit={card.suit} value={card.value} size="lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Cryptographic proof */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
          <div className="text-sm font-bold text-gray-300">🔐 密碼學證明</div>
          <div className="font-mono text-xs text-gray-500 space-y-2 break-all">
            <div>
              <span className="text-gray-600">最終隨機數:</span>{' '}
              <span className="text-indigo-400">{shortenHash(finalRandom, 10)}</span>
            </div>
            <div>
              <span className="text-gray-600">遊戲 ID:</span>{' '}
              <span className="text-gray-400">{gameId}</span>
            </div>
            <div>
              <span className="text-gray-600">區塊鏈 TX:</span>{' '}
              <span className="text-gray-400">{shortenHash(txHash, 10)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            to={`/verifier?id=${gameId}`}
            className="flex items-center justify-center gap-2 bg-indigo-950 hover:bg-indigo-900
                       border border-indigo-700 text-indigo-300 rounded-2xl py-3.5
                       font-semibold transition-colors"
          >
            🔍 驗證此局公平性
          </Link>
          <button
            onClick={() => navigate('/lobby')}
            className="bg-gray-800 hover:bg-gray-700 text-white rounded-2xl py-3.5
                       font-semibold transition-colors"
          >
            🔄 返回大廳
          </button>
        </div>
      </div>
    );
  };

  /* ── Render ─── */
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <StepBar currentPhase={phase} />

      {loading
        ? <Loader text={loadMsg} />
        : phase === 'commit' ? <CommitPhase />
        : phase === 'reveal' ? <RevealPhase />
        : <ResultPhase />
      }
    </div>
  );
}