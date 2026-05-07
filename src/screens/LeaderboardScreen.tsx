import React from 'react';
import SkylineIllustration from '../components/SkylineIllustration';

interface Props {
  onBack: () => void;
}

export default function LeaderboardScreen({ onBack }: Props) {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.topBar}>
          <div style={styles.logoWrap}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <rect width="44" height="44" rx="11" fill="#1d4ed8" />
              <path d="M9 32 L9 20 L16 13 L22 20 L22 13 L30 20 L30 32 Z" fill="white" />
              <rect x="17" y="25" width="9" height="7" fill="#1d4ed8" />
            </svg>
          </div>
          <div style={styles.logoText}>
            <div style={styles.logoCity}>MESTO PRE VŠETKÝCH</div>
          </div>
        </div>
        <SkylineIllustration color="#bfdbfe" opacity={0.5} />
        <div style={styles.titleArea}>
          <h1 style={styles.title}>🏆 REBRÍČKY</h1>
          <p style={styles.sub}>Najlepší hráči kiosku</p>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.comingSoon}>
          <div style={styles.trophyIcon}>🏆</div>
          <p style={styles.comingSoonText}>Rebríčky budú dostupné čoskoro!</p>
          <p style={styles.comingSoonSub}>
            Tu uvidíte najlepšie skóre všetkých hráčov.
          </p>
          <button style={styles.backBtn} onClick={onBack}>
            ← SPÄŤ NA DOMOV
          </button>
        </div>
      </main>

      <div style={styles.footer}>
        <SkylineIllustration color="#c7d2fe" opacity={0.4} flip />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(180deg, #eff6ff 0%, #faf5ff 100%)',
  },
  header: {
    background: 'linear-gradient(180deg, #eff6ff 0%, #e0e7ff 100%)',
    borderBottom: '2px solid #c7d2fe',
    flexShrink: 0,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px 48px 12px',
  },
  logoWrap: {
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(29,78,216,0.3)',
  },
  logoText: {},
  logoCity: {
    fontSize: '20px',
    fontWeight: 900,
    color: '#1e293b',
    letterSpacing: '0.08em',
  },
  titleArea: {
    textAlign: 'center',
    padding: '20px 40px 28px',
  },
  title: {
    fontSize: '52px',
    fontWeight: 900,
    color: '#7c3aed',
    letterSpacing: '0.02em',
  },
  sub: {
    fontSize: '22px',
    color: '#64748b',
    marginTop: '8px',
  },
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  comingSoon: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  trophyIcon: {
    fontSize: '120px',
    lineHeight: 1,
    animation: 'float 3s ease-in-out infinite',
  },
  comingSoonText: {
    fontSize: '36px',
    fontWeight: 800,
    color: '#1e293b',
  },
  comingSoonSub: {
    fontSize: '22px',
    color: '#64748b',
    maxWidth: '600px',
    lineHeight: 1.5,
  },
  backBtn: {
    marginTop: '16px',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: '#fff',
    fontSize: '26px',
    fontWeight: 800,
    padding: '28px 64px',
    borderRadius: '20px',
    border: 'none',
    boxShadow: '0 6px 24px rgba(124,58,237,0.35)',
    letterSpacing: '0.04em',
    cursor: 'pointer',
  },
  footer: {
    flexShrink: 0,
  },
};
