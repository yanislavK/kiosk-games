import React from 'react';
import SkylineIllustration from '../components/SkylineIllustration';
import QuizGame from '../games/quiz/QuizGame';

interface Props {
  onBack: () => void;
}

export default function QuizScreen({ onBack }: Props) {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.topBar}>
          <div style={styles.logo}>
            <div style={styles.logoIconWrap}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <rect width="44" height="44" rx="11" fill="#c2410c" />
                <path d="M9 32 L9 20 L16 13 L22 20 L22 13 L30 20 L30 32 Z" fill="white" />
                <rect x="17" y="25" width="9" height="7" fill="#c2410c" />
              </svg>
            </div>
            <div>
              <div style={styles.logoCity}>MESTO PRE VŠETKÝCH</div>
            </div>
          </div>
          <div style={styles.cityBadge}>🏰 Bratislava</div>
        </div>

        <div style={styles.skylineWrap}>
          <SkylineIllustration color="#fed7aa" opacity={0.6} />
        </div>

        <div style={styles.titleSection}>
          <h1 style={styles.title}>KVÍZ O MESTE</h1>
          <p style={styles.subtitle}>Otestujte svoje vedomosti o Bratislave!</p>
        </div>
      </header>

      <QuizGame onBack={onBack} />

      <div style={styles.footer}>
        <SkylineIllustration color="#fed7aa" opacity={0.4} flip />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(180deg, #fff7ed 0%, #fff 60%, #fff7ed 100%)',
  },
  header: {
    background: 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)',
    borderBottom: '2px solid #fed7aa',
    flexShrink: 0,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 48px 10px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoIconWrap: {
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(194,65,12,0.35)',
  },
  logoCity: {
    fontSize: '20px',
    fontWeight: 900,
    color: '#1e293b',
    letterSpacing: '0.08em',
  },
  cityBadge: {
    background: '#fff',
    border: '2px solid #fed7aa',
    borderRadius: '14px',
    padding: '10px 20px',
    fontSize: '20px',
    fontWeight: 700,
    color: '#ea580c',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  skylineWrap: {
    marginTop: '-4px',
  },
  titleSection: {
    textAlign: 'center',
    padding: '16px 40px 24px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 900,
    color: '#ea580c',
    letterSpacing: '0.02em',
    lineHeight: 1.1,
    textShadow: '0 2px 8px rgba(234,88,12,0.15)',
  },
  subtitle: {
    fontSize: '21px',
    color: '#9a3412',
    marginTop: '6px',
    fontWeight: 500,
  },
  footer: {
    flexShrink: 0,
    marginBottom: '-2px',
  },
};
