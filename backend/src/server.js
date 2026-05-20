require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const healthRouter = require('./routes/health');

const app = express();
const server = http.createServer(app);

// Socket.io 設置（後續遊戲狀態即時同步用）
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// 中介層
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

// 路由
app.use('/api/health', healthRouter);

// Socket.io 連線處理
io.on('connection', (socket) => {
  console.log(`🔌 Socket 連線: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Socket 斷線: ${socket.id}`);
  });
});

// 全域錯誤處理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '伺服器內部錯誤', message: err.message });
});

// 啟動
const PORT = process.env.PORT || 3001;

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 後端伺服器啟動於 http://localhost:${PORT}`);
    console.log(`📡 Socket.io 監聽中...`);
  });
};

start();