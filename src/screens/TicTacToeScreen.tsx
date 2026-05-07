import React, { useState } from 'react';
import Header from '../components/Header';
import SkylineIllustration from '../components/SkylineIllustration';
import TicTacToeGame from '../games/ticTacToe/TicTacToeGame';
import type { GameMode } from '../games/ticTacToe/types';

interface Props {
  onBack: () => void;
}

export default function TicTacToeScreen({ onBack }: Props) {
  const [mode, setMode] = useState<GameMode | null>(null);

  if (!mode) {
    return (
      <div style={styles.container}>
        <Header
          title="KRÍŽIKY – NULIČKY"
          subtitle="Zahrajte si a zabavte sa!"
          accentColor="#2563eb"
        />

        <div style={styles.modeSelect}>
          <p style={styles.modeHint}>Vyberte režim hry:</p>

          <button
            style={{ ...styles.modeBtn, ...styles.modeBtnAI }}
            onClick={() => setMode('ai')}
          >
            <div style={styles.modeBtnIcon}>🤖</div>
            <div style={styles.modeBtnTexts}>
              <span style={styles.modeBtnTitle}>HRAJ PROTI AI</span>
              <span style={styles.modeBtnSub}>1 hráč</span>
            </div>
          </button>

          <button
            style={{ ...styles.modeBtn, ...styles.modeBtnPvP }}
            onClick={() => setMode('pvp')}
          >
            <div style={styles.modeBtnIcon}>👥</div>
            <div style={styles.modeBtnTexts}>
              <span style={styles.modeBtnTitle}>HRAJTE VO DVOJICI</span>
              <span style={styles.modeBtnSub}>2 hráči</span>
            </div>
          </button>

          <button style={styles.backBtn} onClick={onBack}>
            ← SPÄŤ
          </button>
        </div>

        <div style={styles.footer}>
          <SkylineIllustration color="#c7d2fe" opacity={0.5} flip />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header
        title="KRÍŽIKY – NULIČKY"
        subtitle={mode === 'ai' ? 'Hráč vs AI' : 'Hráč vs Hráč'}
        accentColor="#2563eb"
      />
      <TicTacToeGame initialMode={mode} onBack={() => setMode(null)} />
      <div style={styles.footer}>
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
    background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
  },
  modeSelect: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px',
    padding: '40px 80px',
  },
  modeHint: {
    fontSize: '28px',
    color: '#64748b',
    fontWeight: 500,
    marginBottom: '8px',
  },
  modeBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '28px',
    padding: '36px 48px',
    borderRadius: '28px',
    border: 'none',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    transition: 'transform 0.12s, box-shadow 0.12s',
  },
  modeBtnAI: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#fff',
  },
  modeBtnPvP: {
    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    color: '#fff',
  },
  modeBtnIcon: {
    fontSize: '56px',
    lineHeight: 1,
  },
  modeBtnTexts: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
  },
  modeBtnTitle: {
    fontSize: '34px',
    fontWeight: 900,
    letterSpacing: '0.02em',
  },
  modeBtnSub: {
    fontSize: '20px',
    fontWeight: 500,
    opacity: 0.85,
  },
  backBtn: {
    marginTop: '16px',
    background: '#fff',
    color: '#64748b',
    fontSize: '24px',
    fontWeight: 700,
    padding: '24px 56px',
    borderRadius: '20px',
    border: '2px solid #e2e8f0',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    letterSpacing: '0.04em',
    cursor: 'pointer',
  },
  footer: {
    flexShrink: 0,
    marginBottom: '-2px',
  },
};
