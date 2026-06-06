import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { newGameId } from '../utils/crypto';
import { recentGames } from '../utils/gameLogic';

const MOCK_ROOMS = [
  {
    id: 'room_demo_001',
    name: '新手練習桌',
    dealer: '0x742d35Cc6634C0532925a3b8D',
    bet: '0.01 ETH',
    status: 'waiting',
    createdAgo: '2 分鐘前',
  },
  {
    id: 'room_demo_002',
    name: 'VIP 包廂',
    dealer: '0x9e4B5Cf3e8D2a1B7c6F490',
    bet: '0.5 ETH',
    status: 'in_progress',
    createdAgo: '5 分鐘前',
  },
  {
    id: 'room_demo_003',
    name: '公開驗證示範桌',
    dealer: '0x3a5F9d2B1c8E4a7D6f0e1B',
    bet: '0 ETH（展示）',
    status: 'waiting',
    createdAgo: '1 分鐘前',
  },
];

const STATUS = {
  waiting:     { label: '等待玩家', color: 'bg-emerald-900 text-emerald-300 border-emerald-700' },
  in_progress: { label: '遊戲中',   color: 'bg-amber-900 text-amber-300 border-amber-700' },
  completed:   { label: '已結束',   color: 'bg-gray-800 text-gray-400 border-gray-700' },
};

const RESULT_BADGE = {
  player: { label: '勝', color: 'bg-emerald-900 text-emerald-300' },
  dealer: { label: '敗', color: 'bg-red-900 text-red-300' },
  draw:   { label: '平', color: 'bg-gray-700 text-gray-300' },
};

export default function Lobby() {
  const navigate  = useNavigate();
  const { isConnected, connect } = useWallet();

  const [rooms, setRooms]         = useState(MOCK_ROOMS);
  const [showCreate, setCreate]   = useState(false);
  const [roomName, setRoomName]   = useState('');
  const [betAmount, setBetAmount] = useState('0.01');

  const history = recentGames();

  const handleJoin = (roomId) => navigate(`/game/${roomId}`);

  const handleCreate = () => {
    if (!roomName.trim()) return;
    const id = newGameId();
    setRooms(prev => [{
      id,
      name: roomName,
      dealer: '你（新建）',
      bet: `${betAmount} ETH`,
      status: 'waiting',
      createdAgo: '剛剛',
    }, ...prev]);
    setCreate(false);
    setRoomName('');
    navigate(`/game/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🎮 遊戲大廳</h1>
          <p className="text-gray-500 mt-1">所有房間的遊戲結果都可公開驗證</p>
        </div>
        <button
          onClick={() => isConnected ? setCreate(true) : connect()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold
                     rounded-xl px-5 py-2.5 transition-all hover:scale-105"
        >
          ＋ 建立房間
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold text-white">建立新房間</h2>

            <div>
              <label className="text-sm text-gray-400 block mb-1">房間名稱</label>
              <input
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                placeholder="例：我的公平桌"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg
                           px-3 py-2 text-white placeholder-gray-600 outline-none
                           focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">下注金額 (ETH)</label>
              <input
                type="number"
                value={betAmount}
                onChange={e => setBetAmount(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg
                           px-3 py-2 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCreate}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white
                           rounded-xl py-2.5 font-semibold transition-colors"
              >
                建立並進入
              </button>
              <button
                onClick={() => setCreate(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400
                           rounded-xl py-2.5 font-semibold transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room list */}
      <div>
        <h2 className="text-lg font-semibold text-gray-300 mb-3">🏠 開放房間</h2>
        <div className="space-y-4">
          {rooms.map((room) => {
            const st = STATUS[room.status];
            return (
              <div
                key={room.id}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700
                           rounded-2xl p-5 flex items-center justify-between
                           transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg font-bold text-white">{room.name}</span>
                    <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 font-mono truncate">
                    莊家: {room.dealer}
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400 mt-1">
                    <span>💰 {room.bet}</span>
                    <span>🕐 {room.createdAgo}</span>
                  </div>
                </div>

                <button
                  disabled={room.status === 'in_progress'}
                  onClick={() => handleJoin(room.id)}
                  className={`ml-4 rounded-xl px-5 py-2 text-sm font-semibold transition-all
                    ${room.status === 'waiting'
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105'
                      : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                >
                  {room.status === 'waiting' ? '加入 →' : '進行中'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent game history */}
      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-300 mb-3">📜 你的遊戲記錄</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-500 font-medium px-4 py-3">遊戲 ID</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 hidden sm:table-cell">時間</th>
                  <th className="text-center text-gray-500 font-medium px-4 py-3">結果</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 8).map((g, i) => {
                  const badge = RESULT_BADGE[g.result] ?? { label: '?', color: 'bg-gray-700 text-gray-400' };
                  return (
                    <tr key={g.gameId}
                        className={`border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors
                                    ${i === history.slice(0,8).length - 1 ? 'border-b-0' : ''}`}>
                      <td className="px-4 py-3 font-mono text-gray-400 text-xs truncate max-w-[160px]">
                        {g.gameId}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                        {new Date(g.ts).toLocaleString('zh-TW', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/verifier?id=${g.gameId}`}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          驗證 →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="bg-indigo-950/40 border border-indigo-800 rounded-xl p-4
                      flex items-start gap-3">
        <span className="text-xl mt-0.5">ℹ️</span>
        <div className="text-sm text-indigo-300 leading-relaxed">
          每一局遊戲結束後，所有密碼學參數都會公開記錄。
          你可以前往 <Link to="/verifier" className="underline font-semibold">驗證工具</Link> 頁面，
          輸入遊戲 ID 自行驗證公平性。
        </div>
      </div>

    </div>
  );
}
