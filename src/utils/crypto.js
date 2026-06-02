import { ethers } from 'ethers';

/** 生成 32 bytes 隨機種子（十六進位字串） */
export const generateSeed = () =>
  ethers.hexlify(ethers.randomBytes(32));

/** keccak256(seed) */
export const hashSeed = (seed) =>
  ethers.keccak256(ethers.toUtf8Bytes(seed));

/** keccak256(seed1 || seed2) — 合併兩個種子取得最終隨機數 */
export const combineSeeds = (seed1, seed2) => {
  const packed = ethers.concat([
    ethers.toUtf8Bytes(seed1),
    ethers.toUtf8Bytes(seed2),
  ]);
  return ethers.keccak256(packed);
};

/** 縮短 Hash 方便展示，例如 0xabcd…ef12 */
export const shortenHash = (hash, chars = 6) => {
  if (!hash) return '';
  return `${hash.slice(0, chars + 2)}…${hash.slice(-chars)}`;
};

/** 生成模擬區塊鏈交易 Hash */
export const mockTxHash = () =>
  ethers.hexlify(ethers.randomBytes(32));

/** 生成模擬 Game ID */
export const newGameId = () =>
  `game_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;