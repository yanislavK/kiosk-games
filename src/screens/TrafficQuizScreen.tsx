import React, { useState } from 'react';
import SkylineIllustration from '../components/SkylineIllustration';
import TrafficQuizGame from '../games/trafficQuiz/TrafficQuizGame';
import PlayerNameModal from '../components/PlayerNameModal';

interface Props {
  onBack: () => void;
}

export default function TrafficQuizScreen({ onBack }: Props) {
  const [pendingScore, setPendingScore] = useState<number | null>(null);

  return (
    <div style={{ ...styles.container, position: 'relative' }}>
      <header style={styles.header}>
        <div style={styles.topBar}>
          <div style={styles.logo}>
            <div style={styles.logoIconWrap}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <rect width="44" height="44" rx="11" fill="#d97706" />
                <path d="M9 32 L9 20 L16 13 L22 20 L22 13 L30 20 L30 32 Z" fill="white" />
                <rect x="17" y="25" width="9" height="7" fill="#d97706" />
              </svg>
            </div>
            <div>
              <div style={styles.logoCity}>MESTO PRE VŠETKÝCH</div>
            </div>
          </div>

          {/* Mini road signs decoration */}
          <div style={styles.signsDeco}>
            <svg width="120" height="48" viewBox="0 0 120 48" fill="none">
              {/* Mini STOP */}
              <polygon points="16,4 32,4 40,12 40,28 32,36 16,36 8,28 8,12" fill="#E53935" />
              <text x="24" y="25" textAnchor="middle" fontSize="8" fontWeight="900" fill="white" fontFamily="Arial">STOP</text>
              {/* Mini speed limit */}
              <circle cx="70" cy="20" r="18" fill="#E53935" />
              <circle cx="70" cy="20" r="14" fill="white" />
              <text x="70" y="25" textAnchor="middle" fontSize="12" fontWeight="900" fill="#1a1a1a" fontFamily="Arial">50</text>
              {/* Mini no entry */}
              <circle cx="110" cy="20" r="16" fill="#E53935" />
              <rect x="96" y="16" width="28" height="8" rx="3" fill="white" />
            </svg>
          </div>
        </div>

        <div style={styles.skylineWrap}>
          <SkylineIllustration color="#fde68a" opacity={0.6} />
        </div>

        <div style={styles.titleSection}>
          <h1 style={styles.title}>KVÍZ O DOPRAVE</h1>
          <p style={styles.subtitle}>Vyber správnu odpoveď</p>
        </div>
      </header>

      <TrafficQuizGame onBack={onBack} onGameEnd={setPendingScore} />

      <div style={styles.footer}>
        <SkylineIllustration color="#fde68a" opacity={0.4} flip />
      </div>

      {pendingScore !== null && (
        <PlayerNameModal
          gameId="trafficquiz"
          score={pendingScore}
          gameName="Kvíz o doprave"
          onDone={() => setPendingScore(null)}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(180deg, #fffbeb 0%, #fff 55%, #fffbeb 100%)',
  },
  header: {
    background: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)',
    borderBottom: '2px solid #fde68a',
    flexShrink: 0,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 48px 10px',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '14px' },
  logoIconWrap: {
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(217,119,6,0.35)',
  },
  logoCity: { fontSize: '20px', fontWeight: 900, color: '#1e293b', letterSpacing: '0.08em' },
  signsDeco: { opacity: 0.9 },
  skylineWrap: { marginTop: '-4px' },
  titleSection: {
    textAlign: 'center',
    padding: '16px 40px 24px',
  },
  title: {
    fontSize: '50px',
    fontWeight: 900,
    color: '#d97706',
    letterSpacing: '0.02em',
    lineHeight: 1.1,
    textShadow: '0 2px 8px rgba(217,119,6,0.2)',
  },
  subtitle: {
    fontSize: '21px',
    color: '#92400e',
    marginTop: '6px',
    fontWeight: 500,
  },
  footer: { flexShrink: 0, marginBottom: '-2px' },
};
