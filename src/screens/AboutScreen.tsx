import React from 'react';
import SkylineIllustration from '../components/SkylineIllustration';

interface Props {
  onBack: () => void;
}

export default function AboutScreen({ onBack }: Props) {
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
          <div style={styles.logoCity}>MESTO PRE VŠETKÝCH</div>
        </div>
        <SkylineIllustration color="#bfdbfe" opacity={0.5} />
        <div style={styles.titleArea}>
          <h1 style={styles.title}>ℹ️ O KIOSKU</h1>
          <p style={styles.sub}>Smart City kiosk – informácie</p>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.cardIcon}>🏙️</div>
          <h2 style={styles.cardTitle}>Smart City Kiosk</h2>
          <p style={styles.cardText}>
            Tento kiosk je súčasťou projektu Smart City, ktorý prináša moderné
            digitálne služby priamo do centra mesta pre všetkých obyvateľov,
            turistov a návštevníkov.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>🎮</div>
          <h2 style={styles.cardTitle}>Interaktívne hry</h2>
          <p style={styles.cardText}>
            Hrajte zábavné hry so slovenskou tematikou – krížiky-nuličky,
            pamäťové hry, puzzle a kvízy. Ideálne pre rodiny, deti aj turistov.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>📍</div>
          <h2 style={styles.cardTitle}>Verzia</h2>
          <p style={styles.cardText}>
            Kiosk Hry v1.0 · ARBI POINT Smart City Kiosk
          </p>
        </div>

        <button style={styles.backBtn} onClick={onBack}>
          ← SPÄŤ NA DOMOV
        </button>
      </main>

      <div style={styles.footer}>
        <SkylineIllustration color="#bfdbfe" opacity={0.5} flip />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(180deg, #eff6ff 0%, #f0f9ff 100%)',
  },
  header: {
    background: 'linear-gradient(180deg, #eff6ff 0%, #e0f2fe 100%)',
    borderBottom: '2px solid #bae6fd',
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
  logoCity: {
    fontSize: '22px',
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
    color: '#0891b2',
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
    flexDirection: 'column',
    gap: '28px',
    padding: '40px 56px',
    overflowY: 'auto',
  },
  card: {
    background: '#fff',
    borderRadius: '24px',
    padding: '36px 40px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '2px solid #e0f2fe',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardIcon: {
    fontSize: '48px',
    lineHeight: 1,
  },
  cardTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0891b2',
  },
  cardText: {
    fontSize: '20px',
    color: '#475569',
    lineHeight: 1.6,
  },
  backBtn: {
    alignSelf: 'center',
    background: 'linear-gradient(135deg, #0891b2, #0e7490)',
    color: '#fff',
    fontSize: '26px',
    fontWeight: 800,
    padding: '28px 64px',
    borderRadius: '20px',
    border: 'none',
    boxShadow: '0 6px 24px rgba(8,145,178,0.35)',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    marginTop: '8px',
  },
  footer: {
    flexShrink: 0,
  },
};
