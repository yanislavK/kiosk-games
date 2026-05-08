import React, { useState } from 'react';
import SkylineIllustration from '../components/SkylineIllustration';
import SudokuGame from '../games/sudoku/SudokuGame';
import PlayerNameModal from '../components/PlayerNameModal';
import type { Difficulty } from '../games/sudoku/generator';

interface Props {
  onBack: () => void;
}

const DIFFS: { id: Difficulty; label: string; emoji: string; sub: string; hint: string; maxScore: number }[] = [
  { id: 'easy',   label: 'ĽAHKÁ',   emoji: '😊', sub: '36 prázdnych polí', hint: 'Pre začiatočníkov',  maxScore: 1000 },
  { id: 'medium', label: 'STREDNÁ', emoji: '🤔', sub: '46 prázdnych polí', hint: 'Pre skúsených',      maxScore: 2000 },
  { id: 'hard',   label: 'ŤAŽKÁ',   emoji: '🔥', sub: '54 prázdnych polí', hint: 'Výzva pre expertov', maxScore: 3000 },
];

const GRADIENTS = [
  'linear-gradient(135deg, #0d9488, #0f766e)',
  'linear-gradient(135deg, #0f766e, #134e4a)',
  'linear-gradient(135deg, #134e4a, #042f2e)',
];
const BORDERS = ['#99f6e4', '#5eead4', '#2dd4bf'];

export default function SudokuScreen({ onBack }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [pendingScore, setPendingScore] = useState<number | null>(null);

  if (difficulty) {
    const meta = DIFFS.find(d => d.id === difficulty)!;
    return (
      <div style={{ ...styles.container, position: 'relative' }}>
        <header style={styles.headerCompact}>
          <div style={styles.topBarCompact}>
            <LogoBadge />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f766e', letterSpacing: '0.04em' }}>
                SUDOKU 🔢
              </div>
              <div style={{ fontSize: '17px', color: '#0d9488', fontWeight: 500 }}>
                {meta.label} · {meta.sub}
              </div>
            </div>
            <button style={styles.changeBtn} onClick={() => { setDifficulty(null); setPendingScore(null); }}>⚙️</button>
          </div>
        </header>

        <SudokuGame difficulty={difficulty} onBack={onBack} onGameEnd={setPendingScore} />

        <div style={styles.footer}><SkylineIllustration color="#99f6e4" opacity={0.35} flip /></div>

        {pendingScore !== null && (
          <PlayerNameModal
            gameId="sudoku"
            score={pendingScore}
            gameName="Sudoku"
            onDone={() => setPendingScore(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.topBar}><LogoBadge /></div>
        <SkylineIllustration color="#99f6e4" opacity={0.55} />
        <div style={styles.titleSection}>
          <h1 style={styles.title}>SUDOKU 🔢</h1>
          <p style={styles.subtitle}>Vyplň mriežku číslami 1 – 9!</p>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.rulesRow}>
          {[
            { icon: '9️⃣', text: 'Každý riadok, stĺpec a štvorec musí mať čísla 1–9' },
            { icon: '❌', text: 'Max. 3 chyby – potom koniec hry' },
            { icon: '⏱️', text: 'Rýchlosť a presnosť prinášajú body' },
          ].map((r, i) => (
            <div key={i} style={styles.ruleBox}>
              <span style={{ fontSize: '36px' }}>{r.icon}</span>
              <span style={styles.ruleText}>{r.text}</span>
            </div>
          ))}
        </div>

        <div style={styles.diffSection}>
          {DIFFS.map((d, i) => (
            <button
              key={d.id}
              style={{ ...styles.diffBtn, background: GRADIENTS[i], borderColor: BORDERS[i] }}
              onClick={() => setDifficulty(d.id)}
            >
              <span style={{ fontSize: '56px' }}>{d.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={styles.diffLabel}>{d.label}</div>
                <div style={styles.diffSub}>{d.sub}</div>
                <div style={{ marginTop: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 14px', display: 'inline-block', fontSize: '18px', fontWeight: 600, color: '#fff' }}>
                  {d.hint}
                </div>
              </div>
              <div style={styles.scoreBadge}>
                <div style={{ fontSize: '13px', opacity: 0.8 }}>max</div>
                <div style={{ fontSize: '26px', fontWeight: 900 }}>{d.maxScore}</div>
                <div style={{ fontSize: '13px', opacity: 0.8 }}>bodov</div>
              </div>
            </button>
          ))}
        </div>

        <button style={styles.backBtn} onClick={onBack}>← SPÄŤ</button>
      </div>

      <div style={styles.footer}><SkylineIllustration color="#99f6e4" opacity={0.4} flip /></div>
    </div>
  );
}

function LogoBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ borderRadius: '11px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(15,118,110,0.4)' }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <rect width="44" height="44" rx="11" fill="#0f766e" />
          <path d="M9 32 L9 20 L16 13 L22 20 L22 13 L30 20 L30 32 Z" fill="white" />
          <rect x="17" y="25" width="9" height="7" fill="#0f766e" />
        </svg>
      </div>
      <div style={{ fontSize: '18px', fontWeight: 900, color: '#1e293b', letterSpacing: '0.08em' }}>
        MESTO PRE VŠETKÝCH
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(180deg,#f0fdfa 0%,#fff 55%,#f0fdfa 100%)' },
  header: { background: 'linear-gradient(180deg,#f0fdfa 0%,#ccfbf1 100%)', borderBottom: '2px solid #99f6e4', flexShrink: 0 },
  headerCompact: { background: 'linear-gradient(180deg,#f0fdfa 0%,#ccfbf1 100%)', borderBottom: '2px solid #99f6e4', flexShrink: 0, padding: '16px 40px' },
  topBar: { padding: '20px 48px 10px' },
  topBarCompact: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' },
  changeBtn: { background: '#fff', border: '2px solid #99f6e4', borderRadius: '12px', padding: '10px 16px', fontSize: '22px', cursor: 'pointer', color: '#0f766e' },
  titleSection: { textAlign: 'center', padding: '16px 40px 24px' },
  title: { fontSize: '54px', fontWeight: 900, color: '#0f766e', letterSpacing: '0.02em', lineHeight: 1.1, textShadow: '0 2px 8px rgba(15,118,110,0.2)' },
  subtitle: { fontSize: '22px', color: '#0d9488', marginTop: '6px', fontWeight: 500 },
  content: { flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px 48px 16px', overflowY: 'auto' },
  rulesRow: { display: 'flex', gap: '14px' },
  ruleBox: { flex: 1, background: '#fff', border: '2px solid #99f6e4', borderRadius: '18px', padding: '18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  ruleText: { fontSize: '15px', fontWeight: 600, color: '#0d9488', textAlign: 'center', lineHeight: 1.4 },
  diffSection: { display: 'flex', flexDirection: 'column', gap: '18px' },
  diffBtn: { display: 'flex', alignItems: 'center', gap: '24px', padding: '26px 32px', borderRadius: '24px', border: '3px solid', cursor: 'pointer', boxShadow: '0 6px 24px rgba(0,0,0,0.14)', color: '#fff', transition: 'transform 0.12s' },
  diffLabel: { fontSize: '30px', fontWeight: 900, letterSpacing: '0.04em' },
  diffSub: { fontSize: '17px', fontWeight: 500, opacity: 0.85, marginTop: '2px' },
  scoreBadge: { background: 'rgba(255,255,255,0.2)', borderRadius: '14px', padding: '12px 18px', textAlign: 'center', flexShrink: 0, color: '#fff', lineHeight: 1.3 },
  backBtn: { alignSelf: 'center', background: '#fff', color: '#64748b', fontSize: '22px', fontWeight: 700, padding: '20px 52px', borderRadius: '16px', border: '2px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', cursor: 'pointer', marginTop: '4px' },
  footer: { flexShrink: 0, marginBottom: '-2px' },
};
