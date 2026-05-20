const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB 連線成功: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB 連線失敗: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;