import { Link } from 'react-router-dom';

const STEPS = [
  {
    icon: '🔒',
    title: '承諾階段 Commit',
    desc: '玩家與莊家各自生成隨機種子，並提交種子的 Keccak256 雜湊值至區塊鏈。雙方底牌在不知道對方的情況下被永久鎖定。',
    badge: 'Step 1',
    color: 'border-indigo-700 bg-indigo-950/40',
  },
  {
    icon: '🔓',
    title: '揭露階段 Reveal',
    desc: '雙方上傳明文種子，系統驗證每個種子是否與先前提交的雜湊值吻合。兩個種子合併再次雜湊，產生絕對公平的隨機數。',
    badge: 'Step 2',
    color: 'border-violet-700 bg-violet-950/40',
  },
  {
    icon: '✅',
    title: '驗證階段 Verify',
    desc: '任何人都可以下載這局遊戲的所有參數，在本地重新執行計算。若結果與鏈上記錄完全吻合，即可證明莊家從未作弊。',
    badge: 'Step 3',
    color: 'border-emerald-700 bg-emerald-950/40',
  },
];

const FEATURES = [
  { icon: '🚫', title: '防止上帝視角', desc: '莊家在揭露前無法得知玩家的種子，完全無法預先計算結果。' },
  { icon: '📋', title: '不可竄改紀錄', desc: '所有 Hash 透過交易寫入區塊鏈，全球節點共同記錄，無法靜默替換。' },
  { icon: '🌐', title: '任意人可驗證', desc: '開源腳本讓任何驗證者都能在本地重新計算，比對結果是否吻合。' },
  { icon: '⚡', title: '自動強制執行', desc: '智能合約一旦檢測到作弊，立即凍結資金並執行賠付，無需人工介入。' },
];

export default function Home() {
  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24 px-4">
        {/* 背景光暈 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-700
                          rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-2">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            Commit-Reveal 雙盲發牌協議
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white">
            ⛓️ FairChain
          </h1>
          <p className="text-xl text-indigo-300 font-medium">區塊鏈公平遊戲驗證系統</p>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            透過密碼學承諾機制與去中心化審計，確保每一局 21 點遊戲的結果
            都由雙方共同決定——任何人都可以公開驗證，沒有人能單方面作弊。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/lobby"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold
                         rounded-xl px-8 py-3 text-lg transition-all hover:scale-105
                         shadow-lg shadow-indigo-900"
            >
              🎮 進入遊戲大廳
            </Link>
            <Link
              to="/verifier"
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold
                         rounded-xl px-8 py-3 text-lg transition-colors border border-gray-700"
            >
              🔍 驗證工具
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-2">運作原理</h2>
          <p className="text-center text-gray-500 mb-12">三個步驟確保絕對公平</p>

          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div
                key={s.badge}
                className={`rounded-2xl border p-6 space-y-3 ${s.color}`}
              >
                <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                  {s.badge}
                </span>
                <div className="text-4xl">{s.icon}</div>
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Commit-Reveal 圖解 ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-10">密碼學流程圖解</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 font-mono text-sm
                          text-gray-300 leading-loose overflow-x-auto">
            <pre>{`玩家               莊家              區塊鏈
 │                  │                  │
 ├─ seed_P = random │                  │
 ├─ hash_P = keccak256(seed_P)         │
 │                  ├─ seed_D = random │
 │                  ├─ hash_D = keccak256(seed_D)
 │                  │                  │
 ├─── Commit(hash_P) ──────────────────►│ ✅ 鎖定
 │                  ├─ Commit(hash_D) ──►│ ✅ 鎖定
 │                  │                  │
 ├─── Reveal(seed_P) ─────────────────►│ 驗證 keccak256(seed_P) == hash_P
 │                  ├─ Reveal(seed_D) ──►│ 驗證 keccak256(seed_D) == hash_D
 │                  │                  │
 │                  │            final = keccak256(seed_P || seed_D)
 │                  │            → 發牌 → 判定勝負 → 結算
 ◄─────────────────────────────────────┤ 結果永久記錄`}
            </pre>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">系統特點</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3
                           hover:border-indigo-700 transition-colors"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="font-bold text-white">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">準備好了嗎？</h2>
        <p className="text-gray-400 mb-8">親自體驗一局公平的 21 點遊戲</p>
        <Link
          to="/lobby"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white
                     font-bold rounded-2xl px-10 py-4 text-xl transition-all
                     hover:scale-105 shadow-xl shadow-indigo-950"
        >
          🃏 開始遊戲
        </Link>
      </section>

    </div>
  );
}