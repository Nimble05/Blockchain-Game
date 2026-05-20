# 區塊鏈公平遊戲驗證系統

以 21 點（Blackjack）為示範，透過 Commit-Reveal 機制確保遊戲公平。

## 快速啟動

### 前置需求
- Node.js v18+
- Docker Desktop
- MetaMask 瀏覽器插件

### 啟動開發環境

# 1. 啟動 MongoDB
docker-compose up -d

# 2. 啟動後端
cd backend && npm install && npm run dev

# 3. 啟動前端
cd frontend && npm install && npm run dev

# 4. 編譯合約
cd contracts && npm install && npx hardhat compile