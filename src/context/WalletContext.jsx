import { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress]       = useState(null);
  const [isConnected, setConnected] = useState(false);

  const connect = async () => {
    // 優先嘗試真實 MetaMask
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setAddress(accounts[0]);
        setConnected(true);
        return;
      } catch {
        // 使用者拒絕，改用模擬
      }
    }
    // 沒有 MetaMask → 模擬錢包
    const mock = ethers.hexlify(ethers.randomBytes(20));
    setAddress(mock);
    setConnected(true);
  };

  const disconnect = () => {
    setAddress(null);
    setConnected(false);
  };

  return (
    <WalletContext.Provider value={{ address, isConnected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet 必須在 WalletProvider 內使用');
  return ctx;
};