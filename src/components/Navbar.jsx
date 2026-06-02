import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

const NAV = [
  { path: '/',          label: '首頁' },
  { path: '/lobby',     label: '遊戲大廳' },
  { path: '/verifier',  label: '驗證工具' },
];

export default function Navbar() {
  const { address, isConnected, connect, disconnect } = useWallet();
  const { pathname } = useLocation();

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">⛓️</span>
          <span className="font-bold text-white text-lg tracking-tight">FairChain</span>
          <span className="hidden sm:block text-xs text-gray-500 border border-gray-700 rounded px-1.5 py-0.5">
            區塊鏈公平驗證
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {NAV.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${pathname === path
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Wallet */}
        {isConnected ? (
          <button
            onClick={disconnect}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700
                       border border-gray-700 rounded-lg px-3 py-1.5 text-sm transition-colors"
          >
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-gray-300 font-mono text-xs">
              {address.slice(0, 6)}…{address.slice(-4)}
            </span>
          </button>
        ) : (
          <button
            onClick={connect}
            className="bg-indigo-600 hover:bg-indigo-500 text-white
                       rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
          >
            連接錢包
          </button>
        )}
      </div>
    </nav>
  );
}