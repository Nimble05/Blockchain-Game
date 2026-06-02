import { Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Verifier from './pages/Verifier';

export default function App() {
  return (
    <WalletProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/lobby"     element={<Lobby />} />
            <Route path="/game/:id"  element={<Game />} />
            <Route path="/verifier"  element={<Verifier />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </WalletProvider>
  );
}