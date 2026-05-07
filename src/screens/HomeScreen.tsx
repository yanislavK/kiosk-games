import React from 'react';
import SkylineIllustration from '../components/SkylineIllustration';
import GameCard from '../components/GameCard';
import { GAMES } from '../games';

interface Props {
  onPlayGame: (gameId: string) => void;
}

export default function HomeScreen({ onPlayGame }: Props) {
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.topBar}>
          <div style={styles.logo}>
            <div style={styles.logoIconWrap}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#1d4ed8" />
                <path d="M10 34 L10 22 L17 15 L24 22 L24 15 L33 22 L33 34 Z" fill="white" />
                <rect x="19" y="27" width="10" height="7" fill="#1d4ed8" />
              </svg>
            </div>
            <div>
              <div style={styles.logoCity}>MESTO</div>
              <div style={styles.logoSlogan}>PRE VŠETKÝCH</div>
            </div>
          </div>
          <div style={styles.decorTrees}>
            <svg width="80" height="50" viewBox="0 0 80 50" fill="none">
              <circle cx="15" cy="34" r="13" fill="#bbf7d0" />
              <circle cx="40" cy="26" r="18" fill="#86efac" />
              <circle cx="67" cy="34" r="13" fill="#bbf7d0" />
              <rect x="12" y="34" width="6" height="16" fill="#4ade80" />
              <rect x="37" y="26" width="6" height="24" fill="#4ade80" />
              <rect x="64" y="34" width="6" height="16" fill="#4ade80" />
            </svg>
          </div>
        </div>

        <div style={styles.skylineTop}>
          <SkylineIllustration color="#bfdbfe" opacity={0.6} />
        </div>

        <div style={styles.welcome}>
          <h1 style={styles.welcomeTitle}>Vitajte!</h1>
          <p style={styles.welcomeSub}>Vyberte si hru a zabavte sa</p>
        </div>
      </header>

      {/* Game list */}
      <main style={styles.main}>
        <div style={styles.gamesLabel}>DOSTUPNÉ HRY</div>
        <div style={styles.gamesList}>
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} onPlay={onPlayGame} />
          ))}
        </div>
      </main>

      {/* Footer skyline */}
      <div style={styles.skylineBottom}>
        <SkylineIllustration color="#c7d2fe" opacity={0.5} flip />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(180deg, #eff6ff 0%, #f0fdf4 50%, #faf5ff 100%)',
  },
  header: {
    background: 'linear-gradient(180deg, #eff6ff 0%, #e0f2fe 100%)',
    borderBottom: '2px solid #bae6fd',
    flexShrink: 0,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '28px 56px 16px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  logoIconWrap: {
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 4px 14px rgba(29,78,216,0.35)',
  },
  logoCity: {
    fontSize: '26px',
    fontWeight: 900,
    color: '#1e293b',
    letterSpacing: '0.12em',
    lineHeight: 1,
  },
  logoSlogan: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#64748b',
    letterSpacing: '0.1em',
  },
  decorTrees: {
    opacity: 0.85,
  },
  skylineTop: {
    marginTop: '-4px',
  },
  welcome: {
    textAlign: 'center',
    padding: '24px 40px 32px',
  },
  welcomeTitle: {
    fontSize: '60px',
    fontWeight: 900,
    color: '#1e293b',
    letterSpacing: '0.02em',
    lineHeight: 1,
  },
  welcomeSub: {
    fontSize: '26px',
    color: '#64748b',
    marginTop: '10px',
    fontWeight: 500,
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  gamesLabel: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#94a3b8',
    letterSpacing: '0.12em',
    marginBottom: '4px',
  },
  gamesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  skylineBottom: {
    flexShrink: 0,
    marginBottom: '-2px',
  },
};
