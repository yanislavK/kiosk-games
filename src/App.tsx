import { useState, useEffect, useRef } from 'react';
import KioskLayout from './components/KioskLayout';
import BottomNavigation from './components/BottomNavigation';
import HomeScreen from './screens/HomeScreen';
import TicTacToeScreen from './screens/TicTacToeScreen';
import QuizScreen from './screens/QuizScreen';
import MemoryScreen from './screens/MemoryScreen';
import PuzzleScreen from './screens/PuzzleScreen';
import TrafficQuizScreen from './screens/TrafficQuizScreen';
import MathQuizScreen from './screens/MathQuizScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import AboutScreen from './screens/AboutScreen';

type NavTab = 'home' | 'leaderboard' | 'about';
type GameScreen = 'tictactoe' | 'quiz' | 'memory' | 'puzzle' | 'trafficquiz' | 'mathquiz' | null;

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeGame, setActiveGame] = useState<GameScreen>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  // Scale the 1080×1920 screen to fit whatever viewport is available
  useEffect(() => {
    function applyScale() {
      if (!screenRef.current) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scaleX = vw / 1080;
      const scaleY = vh / 1920;
      const scale = Math.min(scaleX, scaleY);
      screenRef.current.style.transform = `scale(${scale})`;
    }
    applyScale();
    window.addEventListener('resize', applyScale);
    return () => window.removeEventListener('resize', applyScale);
  }, []);

  const handlePlayGame = (gameId: string) => {
    if (gameId === 'tictactoe') setActiveGame('tictactoe');
    if (gameId === 'quiz') setActiveGame('quiz');
    if (gameId === 'memory') setActiveGame('memory');
    if (gameId === 'puzzle') setActiveGame('puzzle');
    if (gameId === 'trafficquiz') setActiveGame('trafficquiz');
    if (gameId === 'mathquiz') setActiveGame('mathquiz');
  };

  const handleNavigation = (tab: NavTab) => {
    setActiveGame(null);
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (activeGame === 'tictactoe') {
      return <TicTacToeScreen onBack={() => setActiveGame(null)} />;
    }
    if (activeGame === 'quiz') {
      return <QuizScreen onBack={() => setActiveGame(null)} />;
    }
    if (activeGame === 'memory') {
      return <MemoryScreen onBack={() => setActiveGame(null)} />;
    }
    if (activeGame === 'puzzle') {
      return <PuzzleScreen onBack={() => setActiveGame(null)} />;
    }
    if (activeGame === 'trafficquiz') {
      return <TrafficQuizScreen onBack={() => setActiveGame(null)} />;
    }
    if (activeGame === 'mathquiz') {
      return <MathQuizScreen onBack={() => setActiveGame(null)} />;
    }
    switch (activeTab) {
      case 'home':
        return <HomeScreen onPlayGame={handlePlayGame} />;
      case 'leaderboard':
        return <LeaderboardScreen onBack={() => handleNavigation('home')} />;
      case 'about':
        return <AboutScreen onBack={() => handleNavigation('home')} />;
      default:
        return <HomeScreen onPlayGame={handlePlayGame} />;
    }
  };

  const bottomNav = (
    <BottomNavigation
      active={activeGame ? 'home' : activeTab}
      onNavigate={handleNavigation}
    />
  );

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        overflow: 'hidden',
      }}
    >
      <div
        ref={screenRef}
        style={{
          width: '1080px',
          height: '1920px',
          transformOrigin: 'center center',
          overflow: 'hidden',
          borderRadius: '24px',
          boxShadow: '0 0 80px rgba(0,0,0,0.6)',
        }}
      >
        <KioskLayout bottomNav={bottomNav}>
          {renderContent()}
        </KioskLayout>
      </div>
    </div>
  );
}
