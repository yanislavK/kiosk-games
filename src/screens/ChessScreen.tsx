import { useState } from 'react';
import SkylineIllustration from '../components/SkylineIllustration';
import ChessGame from '../games/chess/ChessGame';
import PlayerNameModal from '../components/PlayerNameModal';
import type { Difficulty } from '../games/chess/engine';

interface Props {
  onBack: () => void;
}

type Phase = 'modeSelect' | 'diffSelect' | 'playing';
type GameMode = 'ai' | '2player';

const DIFFS: { id: Difficulty; label: string; sub: string; emoji: string; maxScore: number; gradient: string; border: string }[] = [
  { id: 'easy',   label: 'ĽAHKÁ',   sub: 'Pre začiatočníkov',  emoji: '😊', maxScore: 1000, gradient: 'linear-gradient(135deg,#1d4ed8,#1e40af)', border: '#60a5fa' },
  { id: 'medium', label: 'STREDNÁ', sub: 'Pre skúsených',      emoji: '🤔', maxScore: 2000, gradient: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: '#a78bfa' },
  { id: 'hard',   label: 'ŤAŽKÁ',   sub: 'Výzva pre expertov', emoji: '🔥', maxScore: 3000, gradient: 'linear-gradient(135deg,#dc2626,#b91c1c)', border: '#f87171' },
];

export default function ChessScreen({ onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('modeSelect');
  const [mode, setMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameKey, setGameKey] = useState(0);
  const [pendingScore, setPendingScore] = useState<number | null>(null);

  const startGame = (m: GameMode, d: Difficulty) => {
    setMode(m);
    setDifficulty(d);
    setGameKey(k => k + 1);
    setPendingScore(null);
    setPhase('playing');
  };

  const handleSelectMode = (m: GameMode) => {
    if (m === 'ai') { setMode('ai'); setPhase('diffSelect'); }
    else startGame('2player', 'easy');
  };

  const handleGameEnd = (score: number, winner: 'white' | 'black' | 'draw') => {
    void winner;
    if (mode === 'ai' && score > 0) setPendingScore(score);
  };

  const handleBack = () => { setPhase('modeSelect'); setPendingScore(null); };
  const handleRestart = () => { setGameKey(k => k + 1); setPendingScore(null); };

  /* ── Playing screen ─────────────────────────────────────── */
  if (phase === 'playing') {
    const diffMeta = DIFFS.find(d => d.id === difficulty);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a', position: 'relative' }}>
        <header style={{ background: 'linear-gradient(180deg,#1e293b 0%,#0f172a 100%)', borderBottom: '2px solid #1e3a5f', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 40px' }}>
            <LogoBadge />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#e2e8f0', letterSpacing: '0.04em' }}>♟ ŠACH</div>
              <div style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>
                {mode === 'ai' ? `Proti AI · ${diffMeta?.label ?? ''}` : 'Dvaja hráči'}
              </div>
            </div>
            <button onClick={handleBack} style={{ background: 'rgba(255,255,255,0.07)', border: '2px solid #334155', borderRadius: 14, padding: '10px 18px', color: '#94a3b8', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
          </div>
        </header>

        <ChessGame
          key={gameKey}
          mode={mode}
          difficulty={difficulty}
          onGameEnd={handleGameEnd}
          onBack={handleBack}
          onRestart={handleRestart}
        />

        {pendingScore !== null && (
          <PlayerNameModal
            gameId="chess"
            score={pendingScore}
            gameName="Šach"
            onDone={() => { setPendingScore(null); handleBack(); }}
          />
        )}
      </div>
    );
  }

  /* ── Difficulty selection ───────────────────────────────── */
  if (phase === 'diffSelect') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)' }}>
        <header style={{ background: 'linear-gradient(180deg,#1e293b 0%,#0f172a 100%)', borderBottom: '2px solid #1e3a5f', flexShrink: 0 }}>
          <div style={{ padding: '20px 48px 10px' }}><LogoBadge /></div>
          <div style={{ textAlign: 'center', padding: '12px 40px 24px' }}>
            <h1 style={{ fontSize: 52, fontWeight: 900, color: '#e2e8f0', letterSpacing: '0.02em', margin: 0 }}>♟ ŠACH</h1>
            <p style={{ fontSize: 22, color: '#64748b', marginTop: 6 }}>Vyber obtiažnosť AI súpera</p>
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, padding: '36px 48px', overflowY: 'auto', justifyContent: 'center' }}>
          {DIFFS.map(d => (
            <button key={d.id} onClick={() => startGame('ai', d.id)} style={{
              display: 'flex', alignItems: 'center', gap: 24,
              padding: '28px 32px', borderRadius: 24,
              background: d.gradient, border: `3px solid ${d.border}`,
              cursor: 'pointer', boxShadow: '0 6px 24px rgba(0,0,0,0.3)', color: '#fff',
            }}>
              <span style={{ fontSize: 56 }}>{d.emoji}</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '0.04em' }}>{d.label}</div>
                <div style={{ fontSize: 18, opacity: 0.85, marginTop: 4 }}>{d.sub}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: '12px 18px', textAlign: 'center', lineHeight: 1.3 }}>
                <div style={{ fontSize: 13, opacity: 0.8 }}>max</div>
                <div style={{ fontSize: 28, fontWeight: 900 }}>{d.maxScore}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>bodov</div>
              </div>
            </button>
          ))}
          <button onClick={() => setPhase('modeSelect')} style={{ alignSelf: 'center', background: 'rgba(255,255,255,0.07)', color: '#64748b', fontSize: 22, fontWeight: 700, padding: '20px 52px', borderRadius: 16, border: '2px solid rgba(255,255,255,0.1)', cursor: 'pointer', marginTop: 8 }}>
            ← SPÄŤ
          </button>
        </div>
      </div>
    );
  }

  /* ── Mode selection ─────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)' }}>
      <header style={{ background: 'linear-gradient(180deg,#1e293b 0%,#0f172a 100%)', borderBottom: '2px solid #1e3a5f', flexShrink: 0 }}>
        <div style={{ padding: '20px 48px 10px' }}><LogoBadge /></div>
        <SkylineIllustration color="#334155" opacity={0.45} />
        <div style={{ textAlign: 'center', padding: '12px 40px 24px' }}>
          <h1 style={{ fontSize: 64, fontWeight: 900, color: '#e2e8f0', letterSpacing: '0.02em', margin: 0, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>♟ ŠACH</h1>
          <p style={{ fontSize: 24, color: '#64748b', marginTop: 8 }}>Klasická hra pre dvoch</p>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, padding: '40px 48px', justifyContent: 'center' }}>
        {/* Rules */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
          {[
            { icon: '♟', text: 'Všetky šachové pravidlá vrátane rošády a en passant' },
            { icon: '🤖', text: 'AI súper s tromi úrovňami obtiažnosti' },
            { icon: '👥', text: 'Hra pre dvoch hráčov na jednej obrazovke' },
          ].map((r, i) => (
            <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.09)', borderRadius: 18, padding: '18px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 36 }}>{r.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#64748b', textAlign: 'center', lineHeight: 1.4 }}>{r.text}</span>
            </div>
          ))}
        </div>

        {/* Mode buttons */}
        <button onClick={() => handleSelectMode('ai')} style={{
          display: 'flex', alignItems: 'center', gap: 24, padding: '32px 40px',
          borderRadius: 24, background: 'linear-gradient(135deg,#1e3a5f,#1e40af)',
          border: '3px solid #3b82f6', cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(37,99,235,0.3)', color: '#fff',
        }}>
          <span style={{ fontSize: 72 }}>🤖</span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '0.02em' }}>PROTI AI</div>
            <div style={{ fontSize: 20, opacity: 0.8, marginTop: 4 }}>3 úrovne obtiažnosti · Body do rebríčka</div>
          </div>
          <span style={{ fontSize: 32, opacity: 0.7 }}>→</span>
        </button>

        <button onClick={() => handleSelectMode('2player')} style={{
          display: 'flex', alignItems: 'center', gap: 24, padding: '32px 40px',
          borderRadius: 24, background: 'linear-gradient(135deg,#134e4a,#0d9488)',
          border: '3px solid #2dd4bf', cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(20,184,166,0.22)', color: '#fff',
        }}>
          <span style={{ fontSize: 72 }}>👥</span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '0.02em' }}>DVAJA HRÁČI</div>
            <div style={{ fontSize: 20, opacity: 0.8, marginTop: 4 }}>Hrajte na rovnakej obrazovke</div>
          </div>
          <span style={{ fontSize: 32, opacity: 0.7 }}>→</span>
        </button>

        <button onClick={onBack} style={{ alignSelf: 'center', background: 'rgba(255,255,255,0.05)', color: '#475569', fontSize: 22, fontWeight: 700, padding: '20px 52px', borderRadius: 16, border: '2px solid rgba(255,255,255,0.09)', cursor: 'pointer', marginTop: 16 }}>
          ← SPÄŤ
        </button>
      </div>

      <div style={{ flexShrink: 0, marginBottom: -2 }}>
        <SkylineIllustration color="#334155" opacity={0.25} flip />
      </div>
    </div>
  );
}

function LogoBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ borderRadius: 11, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <rect width="44" height="44" rx="11" fill="#1e3a5f" />
          <path d="M9 32 L9 20 L16 13 L22 20 L22 13 L30 20 L30 32 Z" fill="white" />
          <rect x="17" y="25" width="9" height="7" fill="#1e3a5f" />
        </svg>
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: '#e2e8f0', letterSpacing: '0.08em' }}>
        MESTO PRE VŠETKÝCH
      </div>
    </div>
  );
}
