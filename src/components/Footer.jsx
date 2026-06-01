export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900 py-6 mt-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row
                      items-center justify-between gap-2 text-sm text-gray-500">
        <span>⛓️ FairChain — 區塊鏈公平遊戲驗證系統</span>
        <span className="font-mono text-xs">
          Powered by Commit-Reveal + Keccak256
        </span>
      </div>
    </footer>
  );
}