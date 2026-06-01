import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PlayingCard from '../components/PlayingCard';
import {
  hashSeed, combineSeeds, shortenHash,
} from '../utils/crypto';
import {
  dealCards, calcScore, determineWinner,
  loadGame, recentGames,
} from '../utils/gameLogic';

function CheckRow({ label, expected, got, ok }) {
  return (
    <div className={`rounded-xl border p-3 space-y-1
      ${ok ? 'border-emerald-800 bg-emerald-950/30' : 'border-red-800 bg-red-950/30'}`}>
      <div className="flex items-center gap-2">
        <span>{ok ? '✅' : '❌'}</span>
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      {!ok && (
        <div className="text-xs font-mono text-red-400 space-y-0.5 pl-6">
          <div>期望: {expected}</div>
          <div>實際: {got}</div>
        </div>
      )}
    </div>
  );
}

export default function Verifier() {
  const [params]  = useSearchParams();
  const [gameId, setGameId] = useState(params.get('id') || '');
  const [game,   setGame]   = useState(null);
  const [checks, setChecks] = useState(null);
  const [error,  setError]  = useState('');
  const [recent] = useState(() => recentGames());

  // 若 URL 有帶 id，自動載入
  useEffect(() => {
    const urlId = params.get('id');
    if (urlId) {
      setGameId(urlId);
      runVerify(urlId);
    }
  }, []);

  const runVerify = (id) => {
    setError('');
    setChecks(null);
    setGame(null);

    const data = loadGame(id || gameId);
    if (!data) {
      setError('找不到該遊戲 ID，請確認是否有在本瀏覽器中玩過此局。');
      return;
    }
    setGame(data);

    // 1. 驗證玩家 Hash
    const pHashOk = hashSeed(data.playerSeed) === data.playerHash;
    // 2. 驗證莊家 Hash
    const dHashOk = hashSeed(data.dealerSeed) === data.dealerHash;
    // 3. 驗證最終隨機數
    const finalOk = combineSeeds(data.playerSeed, data.dealerSeed) === data.finalRandom;
    // 4. 驗證遊戲結果
    const { playerHand, dealerHand } = dealCards(data.finalRandom);
    const recalcResult = determineWinner(playerHand, dealerHand);
    const resultOk = recalcResult.winner === data.result.winner;

    setChecks({ pHashOk, dHashOk, finalOk, resultOk });
  };

  const allPassed = checks && checks.pHashOk && checks.dHashOk
                 && checks.finalOk && checks.resultOk;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">🔍 遊戲驗證工具</h1>
        <p className="text-gray-400 mt-2">
          輸入任意遊戲 ID，在本地重新計算，確認結果是否被篡改
        </p>
      </div>

      {/* Input */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
        <label className="text-sm text-gray-400 font-medium">遊戲 ID</label>
        <div className="flex gap-2">
          <input
            value={gameId}
            onChange={e => setGameId(e.target.value)}
            placeholder="game_1716... 或從下方選擇"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2
                       text-white placeholder-gray-600 font-mono text-sm outline-none
                       focus:border-indigo-500"
          />
          <button
            onClick={() => runVerify(gameId)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl
                       px-5 py-2 font-semibold transition-colors whitespace-nowrap"
          >
            驗證
          </button>
        </div>

        {/* Recent games */}
        {recent.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="text-xs text-gray-600 uppercase tracking-wide">最近遊戲</div>
            <div className="flex flex-wrap gap-2">
              {recent.slice(0, 5).map(r => (
                <button
                  key={r.gameId}
                  onClick={() => { setGameId(r.gameId); runVerify(r.gameId); }}
                  className="text-xs font-mono bg-gray-800 hover:bg-gray-700
                             border border-gray-700 rounded-lg px-2 py-1
                             text-gray-400 hover:text-white transition-colors truncate max-w-xs"
                >
                  {r.gameId.slice(0, 30)}…
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
          ⚠️ {error}
          <div className="mt-2 text-gray-500 text-xs">
            提示：先到 <Link to="/lobby" className="text-indigo-400 underline">遊戲大廳</Link> 玩一局，
            再回來這裡驗證。
          </div>
        </div>
      )}

      {/* Results */}
      {game && checks && (
        <div className="space-y-5 animate-fade-in-up">

          {/* Verdict */}
          <div className={`rounded-2xl border p-5 text-center
            ${allPassed
              ? 'bg-emerald-950/50 border-emerald-700'
              : 'bg-red-950/50 border-red-800'}`}>
            <div className="text-4xl mb-2">{allPassed ? '✅' : '🚨'}</div>
            <div className="text-xl font-extrabold text-white">
              {allPassed ? '遊戲完全公平' : '檢測到異常！'}
            </div>
            <div className={`text-sm mt-1 ${allPassed ? 'text-emerald-400' : 'text-red-400'}`}>
              {allPassed
                ? '所有密碼學參數驗證通過，結果未被篡改'
                : '部分驗證失敗，此局遊戲可能存在作弊行為'}
            </div>
          </div>

          {/* Game parameters */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
            <div className="text-sm font-bold text-gray-300 mb-3">📋 遊戲參數</div>
            {[
              { label: '遊戲 ID',    value: game.gameId },
              { label: '時間戳',     value: new Date(game.timestamp).toLocaleString('zh-TW') },
              { label: '玩家種子',   value: shortenHash(game.playerSeed, 12) },
              { label: '玩家 Hash',  value: shortenHash(game.playerHash, 12) },
              { label: '莊家種子',   value: shortenHash(game.dealerSeed, 12) },
              { label: '莊家 Hash',  value: shortenHash(game.dealerHash, 12) },
              { label: '最終隨機數', value: shortenHash(game.finalRandom, 12) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-start gap-4 text-sm">
                <span className="text-gray-500 shrink-0">{label}</span>
                <span className="font-mono text-gray-300 text-right break-all">{value}</span>
              </div>
            ))}
          </div>

          {/* Checks */}
          <div className="space-y-3">
            <div className="text-sm font-bold text-gray-300">🧮 驗證清單</div>
            <CheckRow
              label="玩家種子的 Hash 與承諾吻合"
              ok={checks.pHashOk}
              expected={game.playerHash}
              got={hashSeed(game.playerSeed)}
            />
            <CheckRow
              label="莊家種子的 Hash 與承諾吻合"
              ok={checks.dHashOk}
              expected={game.dealerHash}
              got={hashSeed(game.dealerSeed)}
            />
            <CheckRow
              label="最終隨機數由雙方種子合併計算"
              ok={checks.finalOk}
              expected={game.finalRandom}
              got={combineSeeds(game.playerSeed, game.dealerSeed)}
            />
            <CheckRow
              label="遊戲結果與隨機數計算結果一致"
              ok={checks.resultOk}
              expected={game.result?.winner}
              got={determineWinner(dealCards(game.finalRandom).playerHand,
                                   dealCards(game.finalRandom).dealerHand).winner}
            />
          </div>

          {/* Cards recalc */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="text-sm font-bold text-gray-300">🃏 重新計算的牌面</div>
            {(() => {
              const { playerHand: ph, dealerHand: dh } = dealCards(game.finalRandom);
              return (
                <>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">玩家 — {calcScore(ph)} 點</div>
                    <div className="flex gap-2">
                      {ph.map((c, i) => (
                        <PlayingCard key={i} suit={c.suit} value={c.value} size="md" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">莊家 — {calcScore(dh)} 點</div>
                    <div className="flex gap-2">
                      {dh.map((c, i) => (
                        <PlayingCard key={i} suit={c.suit} value={c.value} size="md" />
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

        </div>
      )}

      {/* Info */}
      {!game && !error && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center
                        text-gray-500 space-y-2">
          <div className="text-4xl">🔍</div>
          <p>輸入遊戲 ID 開始驗證</p>
          <p className="text-xs">
            或先到{' '}
            <Link to="/lobby" className="text-indigo-400 underline">遊戲大廳</Link>
            {' '}玩一局再回來驗證
          </p>
        </div>
      )}

    </div>
  );
}