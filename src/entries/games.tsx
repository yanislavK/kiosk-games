import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import KioskLayout from '../components/KioskLayout';
import HomeScreen from '../screens/HomeScreen';
import TicTacToeScreen from '../screens/TicTacToeScreen';
import QuizScreen from '../screens/QuizScreen';
import MemoryScreen from '../screens/MemoryScreen';
import PuzzleScreen from '../screens/PuzzleScreen';
import TrafficQuizScreen from '../screens/TrafficQuizScreen';
import MathQuizScreen from '../screens/MathQuizScreen';
import StackScreen from '../screens/StackScreen';
import SudokuScreen from '../screens/SudokuScreen';
import ChessScreen from '../screens/ChessScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import AIAssistant from '../components/AIAssistant';
import AboutScreen from '../screens/AboutScreen';

type NavTab = 'home' | 'leaderboard' | 'about';
type GameScreen = 'tictactoe' | 'quiz' | 'memory' | 'puzzle' | 'trafficquiz' | 'mathquiz' | 'stack' | 'sudoku' | 'chess' | null;

const NAV_ITEMS: { id: NavTab; label: string; icon: string }[] = [
  { id: 'home',        label: 'DOMOV',    icon: '🏠' },
  { id: 'leaderboard', label: 'REBRÍČKY', icon: '🏆' },
  { id: 'about',       label: 'O KIOSKU', icon: 'ℹ️' },
];

function GamesApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeGame, setActiveGame] = useState<GameScreen>(null);
  const [showAI, setShowAI] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function applyScale() {
      if (!screenRef.current) return;
      const scale = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
      screenRef.current.style.transform = `scale(${scale})`;
    }
    applyScale();
    window.addEventListener('resize', applyScale);
    return () => window.removeEventListener('resize', applyScale);
  }, []);

  const handlePlayGame = (gameId: string) => {
    const games: GameScreen[] = ['tictactoe', 'quiz', 'memory', 'puzzle', 'trafficquiz', 'mathquiz', 'stack', 'sudoku', 'chess'];
    if (games.includes(gameId as GameScreen)) setActiveGame(gameId as GameScreen);
  };

  const handleNavigation = (tab: NavTab) => {
    setActiveGame(null);
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (activeGame === 'tictactoe') return <TicTacToeScreen onBack={() => setActiveGame(null)} />;
    if (activeGame === 'quiz')      return <QuizScreen       onBack={() => setActiveGame(null)} />;
    if (activeGame === 'memory')    return <MemoryScreen     onBack={() => setActiveGame(null)} />;
    if (activeGame === 'puzzle')    return <PuzzleScreen     onBack={() => setActiveGame(null)} />;
    if (activeGame === 'trafficquiz') return <TrafficQuizScreen onBack={() => setActiveGame(null)} />;
    if (activeGame === 'mathquiz')  return <MathQuizScreen   onBack={() => setActiveGame(null)} />;
    if (activeGame === 'stack')     return <StackScreen      onBack={() => setActiveGame(null)} />;
    if (activeGame === 'sudoku')    return <SudokuScreen     onBack={() => setActiveGame(null)} />;
    if (activeGame === 'chess')     return <ChessScreen      onBack={() => setActiveGame(null)} />;
    switch (activeTab) {
      case 'home':        return <HomeScreen onPlayGame={handlePlayGame} />;
      case 'leaderboard': return <LeaderboardScreen onBack={() => handleNavigation('home')} />;
      case 'about':       return <AboutScreen onBack={() => handleNavigation('home')} />;
      default:            return <HomeScreen onPlayGame={handlePlayGame} />;
    }
  };

  const activeNavItem = activeGame ? 'home' : activeTab;

  const bottomNav = (
    <nav style={{ display: 'flex', background: '#fff', borderTop: '2px solid #e2e8f0', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', flexShrink: 0 }}>
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => handleNavigation(item.id)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 16px 24px',
            background: activeNavItem === item.id ? '#eff6ff' : 'transparent',
            border: 'none',
            gap: '6px',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          <span style={{ fontSize: '32px', lineHeight: 1 }}>{item.icon}</span>
          <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.06em', color: activeNavItem === item.id ? '#2563eb' : '#64748b' }}>
            {item.label}
          </span>
          {activeNavItem === item.id && (
            <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '4px', background: '#2563eb', borderRadius: '0 0 4px 4px' }} />
          )}
        </button>
      ))}
    </nav>
  );

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', overflow: 'hidden' }}>
      <div
        ref={screenRef}
        style={{ width: '1080px', height: '1920px', transformOrigin: 'center center', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 0 80px rgba(0,0,0,0.6)' }}
      >
        <KioskLayout bottomNav={bottomNav}>
          {renderContent()}
        </KioskLayout>

        {!showAI && (
          <button
            className="ai-fab"
            onClick={() => setShowAI(true)}
            style={{ position: 'fixed', bottom: 164, right: 36, width: 86, height: 86, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: '3px solid #818cf8', fontSize: 36, cursor: 'pointer', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            🤖
          </button>
        )}
        {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GamesApp />
  </React.StrictMode>
);
