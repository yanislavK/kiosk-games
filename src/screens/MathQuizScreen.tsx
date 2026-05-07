import React, { useState } from 'react';
import SkylineIllustration from '../components/SkylineIllustration';
import MathQuizGame from '../games/mathQuiz/MathQuizGame';
import type { Difficulty } from '../games/mathQuiz/types';
import { DIFF_CONFIGS } from '../games/mathQuiz/types';

interface Props {
  onBack: () => void;
}

export default function MathQuizScreen({ onBack }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  if (difficulty) {
    return (
      <div style={styles.container}>
        <header style={styles.headerCompact}>
          <div style={styles.topBarCompact}>
            <LogoBadge />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#0891b2', letterSpacing: '0.04em' }}>
                MATEMATIKA 🧮
              </div>
              <div style={{ fontSize: '17px', color: '#0e7490', fontWeight: 500 }}>
                {DIFF_CONFIGS[difficulty].label} · {DIFF_CONFIGS[difficulty].sublabel}
              </div>
            </div>
            <button style={styles.changeBtn} onClick={() => setDifficulty(null)}>⚙️</button>
          </div>
        </header>

        <MathQuizGame key={difficulty} difficulty={difficulty} onBack={onBack} />

        <div style={styles.footer}><SkylineIllustration color="#a5f3fc" opacity={0.35} flip /></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.topBar}><LogoBadge /></div>
        <SkylineIllustration color="#a5f3fc" opacity={0.55} />
        <div style={styles.titleSection}>
          <h1 style={styles.title}>MATEMATIKA 🧮</h1>
          <p style={styles.subtitle}>Vyber obtiažnosť a vypočítaj príklady!</p>
        </div>
      </header>

      <div style={styles.content}>
        {/* How to play */}
        <div style={styles.rulesRow}>
          {[
            { icon: '⏱️', text: 'Každý príklad má časový limit' },
            { icon: '🔥', text: 'Séria správnych = bonusové body' },
            { icon: '⭐', text: 'Správna odpoveď = 10+ bodov' },
          ].map((r, i) => (
            <div key={i} style={styles.ruleBox}>
              <span style={{ fontSize: '36px' }}>{r.icon}</span>
              <span style={styles.ruleText}>{r.text}</span>
            </div>
          ))}
        </div>

        {/* Difficulty cards */}
        <div style={styles.diffSection}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
            const cfg = DIFF_CONFIGS[d];
            const palettes = {
              easy:   { bg: 'linear-gradient(135deg,#06b6d4,#0891b2)', border: '#a5f3fc', timer: '15s' },
              medium: { bg: 'linear-gradient(135deg,#0891b2,#0e7490)', border: '#67e8f9', timer: '12s' },
              hard:   { bg: 'linear-gradient(135deg,#0e7490,#155e75)', border: '#22d3ee', timer: '8s' },
            }[d];
            return (
              <button key={d}
                style={{ ...styles.diffBtn, background: palettes.bg, borderColor: palettes.border }}
                onClick={() => setDifficulty(d)}
              >
                <span style={{ fontSize: '52px' }}>{cfg.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={styles.diffLabel}>{cfg.label}</div>
                  <div style={styles.diffSub}>{cfg.sublabel}</div>
                  <div style={styles.diffExample}>
                    <span style={styles.diffExCode}>{cfg.example}</span>
                  </div>
                </div>
                <div style={styles.timerBadge}>
                  <div style={{ fontSize: '13px', opacity: 0.8 }}>čas</div>
                  <div style={{ fontSize: '22px', fontWeight: 900 }}>{palettes.timer}</div>
                </div>
              </button>
            );
          })}
        </div>

        <button style={styles.backBtn} onClick={onBack}>← SPÄŤ</button>
      </div>

      <div style={styles.footer}><SkylineIllustration color="#a5f3fc" opacity={0.4} flip /></div>
    </div>
  );
}

function LogoBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ borderRadius: '11px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(8,145,178,0.4)' }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <rect width="44" height="44" rx="11" fill="#0891b2" />
          <path d="M9 32 L9 20 L16 13 L22 20 L22 13 L30 20 L30 32 Z" fill="white" />
          <rect x="17" y="25" width="9" height="7" fill="#0891b2" />
        </svg>
      </div>
      <div style={{ fontSize: '18px', fontWeight: 900, color: '#1e293b', letterSpacing: '0.08em' }}>
        MESTO PRE VŠETKÝCH
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(180deg,#ecfeff 0%,#fff 55%,#ecfeff 100%)' },
  header: { background: 'linear-gradient(180deg,#ecfeff 0%,#cffafe 100%)', borderBottom: '2px solid #a5f3fc', flexShrink: 0 },
  headerCompact: { background: 'linear-gradient(180deg,#ecfeff 0%,#cffafe 100%)', borderBottom: '2px solid #a5f3fc', flexShrink: 0, padding: '16px 40px' },
  topBar: { padding: '20px 48px 10px' },
  topBarCompact: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' },
  changeBtn: { background: '#fff', border: '2px solid #a5f3fc', borderRadius: '12px', padding: '10px 16px', fontSize: '22px', cursor: 'pointer', color: '#0891b2' },
  titleSection: { textAlign: 'center', padding: '16px 40px 24px' },
  title: { fontSize: '50px', fontWeight: 900, color: '#0891b2', letterSpacing: '0.02em', lineHeight: 1.1, textShadow: '0 2px 8px rgba(8,145,178,0.2)' },
  subtitle: { fontSize: '21px', color: '#0e7490', marginTop: '6px', fontWeight: 500 },
  content: { flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px 48px 16px', overflowY: 'auto' },
  rulesRow: { display: 'flex', gap: '14px' },
  ruleBox: { flex: 1, background: '#fff', border: '2px solid #a5f3fc', borderRadius: '18px', padding: '18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  ruleText: { fontSize: '15px', fontWeight: 600, color: '#0e7490', textAlign: 'center', lineHeight: 1.4 },
  diffSection: { display: 'flex', flexDirection: 'column', gap: '18px' },
  diffBtn: { display: 'flex', alignItems: 'center', gap: '24px', padding: '26px 32px', borderRadius: '24px', border: '3px solid', cursor: 'pointer', boxShadow: '0 6px 24px rgba(0,0,0,0.14)', color: '#fff', transition: 'transform 0.12s' },
  diffLabel: { fontSize: '28px', fontWeight: 900, letterSpacing: '0.04em' },
  diffSub: { fontSize: '17px', fontWeight: 500, opacity: 0.9, marginTop: '2px' },
  diffExample: { marginTop: '8px' },
  diffExCode: { background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 12px', fontSize: '20px', fontWeight: 800, letterSpacing: '0.04em' },
  timerBadge: { background: 'rgba(255,255,255,0.2)', borderRadius: '14px', padding: '10px 16px', textAlign: 'center', flexShrink: 0, color: '#fff' },
  backBtn: { alignSelf: 'center', background: '#fff', color: '#64748b', fontSize: '22px', fontWeight: 700, padding: '20px 52px', borderRadius: '16px', border: '2px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', cursor: 'pointer', marginTop: '4px' },
  footer: { flexShrink: 0, marginBottom: '-2px' },
};
