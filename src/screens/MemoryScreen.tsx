import React, { useState } from 'react';
import SkylineIllustration from '../components/SkylineIllustration';
import MemoryGame from '../games/memory/MemoryGame';
import type { Difficulty } from '../games/memory/types';
import { GRID_CONFIGS } from '../games/memory/types';

interface Props {
  onBack: () => void;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export default function MemoryScreen({ onBack }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  if (!difficulty) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.topBar}>
            <div style={styles.logo}>
              <div style={styles.logoIconWrap}>
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <rect width="44" height="44" rx="11" fill="#15803d" />
                  <path d="M9 32 L9 20 L16 13 L22 20 L22 13 L30 20 L30 32 Z" fill="white" />
                  <rect x="17" y="25" width="9" height="7" fill="#15803d" />
                </svg>
              </div>
              <div style={styles.logoCity}>MESTO PRE VŠETKÝCH</div>
            </div>
          </div>
          <SkylineIllustration color="#bbf7d0" opacity={0.65} />
          <div style={styles.titleSection}>
            <h1 style={styles.title}>PAMÄŤ / NÁJDI PÁRY</h1>
            <p style={styles.subtitle}>Nájdite všetky rovnaké dvojice!</p>
          </div>
        </header>

        <div style={styles.difficultySection}>
          <p style={styles.difficultyHint}>Vyberte obtiažnosť:</p>

          <div style={styles.difficultyCards}>
            {DIFFICULTIES.map((d) => {
              const cfg = GRID_CONFIGS[d];
              const colors: Record<Difficulty, { bg: string; border: string; text: string }> = {
                easy:   { bg: 'linear-gradient(135deg,#22c55e,#16a34a)', border: '#bbf7d0', text: '#fff' },
                medium: { bg: 'linear-gradient(135deg,#16a34a,#15803d)', border: '#86efac', text: '#fff' },
                hard:   { bg: 'linear-gradient(135deg,#15803d,#14532d)', border: '#4ade80', text: '#fff' },
              };
              const c = colors[d];
              return (
                <button
                  key={d}
                  style={{
                    ...styles.diffBtn,
                    background: c.bg,
                    borderColor: c.border,
                  }}
                  onClick={() => setDifficulty(d)}
                >
                  <div style={styles.diffBtnGrid}>
                    {Array.from({ length: cfg.cols * 2 }).map((_, i) => (
                      <div key={i} style={styles.miniCard} />
                    ))}
                  </div>
                  <div style={styles.diffBtnTexts}>
                    <span style={{ ...styles.diffBtnLabel, color: c.text }}>{cfg.label}</span>
                    <span style={{ ...styles.diffBtnSub, color: c.text }}>{cfg.sublabel} · {cfg.pairs} párov</span>
                  </div>
                </button>
              );
            })}
          </div>

          <button style={styles.backBtn} onClick={onBack}>← SPÄŤ</button>
        </div>

        <div style={styles.footer}>
          <SkylineIllustration color="#bbf7d0" opacity={0.4} flip />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.headerCompact}>
        <div style={styles.topBarCompact}>
          <div style={styles.logo}>
            <div style={styles.logoIconWrap}>
              <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
                <rect width="44" height="44" rx="11" fill="#15803d" />
                <path d="M9 32 L9 20 L16 13 L22 20 L22 13 L30 20 L30 32 Z" fill="white" />
                <rect x="17" y="25" width="9" height="7" fill="#15803d" />
              </svg>
            </div>
            <div>
              <div style={{ ...styles.title, fontSize: '36px' }}>PAMÄŤ / NÁJDI PÁRY</div>
              <div style={styles.subtitle}>{GRID_CONFIGS[difficulty].label} · {GRID_CONFIGS[difficulty].sublabel}</div>
            </div>
          </div>
          <button style={styles.changeDiffBtn} onClick={() => setDifficulty(null)}>
            ⚙️ Obtiažnosť
          </button>
        </div>
      </header>

      <MemoryGame difficulty={difficulty} onBack={onBack} />

      <div style={styles.footer}>
        <SkylineIllustration color="#bbf7d0" opacity={0.35} flip />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(180deg, #f0fdf4 0%, #fff 60%, #f0fdf4 100%)',
  },
  header: {
    background: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)',
    borderBottom: '2px solid #bbf7d0',
    flexShrink: 0,
  },
  headerCompact: {
    background: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)',
    borderBottom: '2px solid #bbf7d0',
    flexShrink: 0,
    padding: '16px 40px',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 48px 10px',
  },
  topBarCompact: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '14px' },
  logoIconWrap: {
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(21,128,61,0.35)',
  },
  logoCity: { fontSize: '20px', fontWeight: 900, color: '#1e293b', letterSpacing: '0.08em' },
  titleSection: { textAlign: 'center', padding: '16px 40px 24px' },
  title: { fontSize: '44px', fontWeight: 900, color: '#16a34a', letterSpacing: '0.02em', lineHeight: 1.1 },
  subtitle: { fontSize: '20px', color: '#15803d', marginTop: '6px', fontWeight: 500 },
  changeDiffBtn: {
    background: '#fff',
    border: '2px solid #bbf7d0',
    borderRadius: '14px',
    padding: '12px 20px',
    fontSize: '18px',
    fontWeight: 700,
    color: '#16a34a',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  difficultySection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px',
    padding: '40px 72px',
  },
  difficultyHint: { fontSize: '28px', color: '#64748b', fontWeight: 500 },
  difficultyCards: {
    display: 'flex',
    gap: '24px',
    width: '100%',
  },
  diffBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '32px 20px',
    borderRadius: '28px',
    border: '3px solid',
    boxShadow: '0 8px 28px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    transition: 'transform 0.12s',
  },
  diffBtnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '5px',
  },
  miniCard: {
    width: '22px',
    height: '28px',
    background: 'rgba(255,255,255,0.35)',
    borderRadius: '5px',
    border: '1.5px solid rgba(255,255,255,0.5)',
  },
  diffBtnTexts: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  diffBtnLabel: { fontSize: '28px', fontWeight: 900, letterSpacing: '0.04em' },
  diffBtnSub: { fontSize: '18px', fontWeight: 500, opacity: 0.9 },
  backBtn: {
    background: '#fff',
    color: '#64748b',
    fontSize: '24px',
    fontWeight: 700,
    padding: '24px 56px',
    borderRadius: '18px',
    border: '2px solid #e2e8f0',
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    letterSpacing: '0.04em',
    marginTop: '8px',
  },
  footer: { flexShrink: 0, marginBottom: '-2px' },
};
