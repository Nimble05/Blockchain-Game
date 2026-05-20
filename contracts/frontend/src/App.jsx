import { Routes, Route } from 'react-router-dom';

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-indigo-400">
          ⛓️ 區塊鏈公平遊戲驗證系統
        </h1>
        <p className="text-gray-400 text-lg">
          以 21 點為示範，透過 Commit-Reveal 機制確保遊戲公平
        </p>
        <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-green-400 font-mono text-sm">
            ✅ 前端環境啟動成功
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

export default App;