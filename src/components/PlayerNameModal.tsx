import React, { useState, useRef, useEffect } from 'react';
import { submitScore } from '../lib/api';

interface Props {
  gameId: string;
  score: number;
  gameName: string;
  onDone: () => void;
}

type Phase = 'input' | 'submitting' | 'done';

const MAX = 50;

export default function PlayerNameModal({ gameId, score, gameName, onDone }: Props) {
  const [name, setName] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [rank, setRank] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed || phase !== 'input') return;
    setPhase('submitting');
    const result = await submitScore(gameId, trimmed, score);
    setRank(result?.rank ?? null);
    setPhase('done');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit();
  };

  if (phase === 'done') {
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏆';
    return (
      <div style={overlay}>
        <div style={modal}>
          <div style={{ fontSize: '100px', lineHeight: 1 }}>{medal}</div>
          <div style={{ fontSize: '44px', fontWeight: 900, color: '#1e293b', marginTop: '16px' }}>
            {rank !== null ? `#${rank} MIESTO!` : 'ULOŽENÉ!'}
          </div>
          {rank !== null && rank <= 3 && (
            <div style={{ fontSize: '28px', color: '#7c3aed', fontWeight: 700, marginTop: '8px' }}>
              {rank === 1 ? 'PRVÉ MIESTO!' : rank === 2 ? 'DRUHÉ MIESTO!' : 'TRETIE MIESTO!'}
            </div>
          )}
          {rank !== null && rank > 3 && rank <= 10 && (
            <div style={{ fontSize: '28px', color: '#0891b2', fontWeight: 700, marginTop: '8px' }}>TOP 10!</div>
          )}
          <div style={{ fontSize: '26px', color: '#64748b', marginTop: '12px', fontWeight: 600 }}>
            {name.trim()} · {score} bodov
          </div>
          <button onClick={onDone} style={confirmBtn}>POKRAČOVAŤ →</button>
        </div>
      </div>
    );
  }

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0 && phase === 'input';

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ fontSize: '26px', color: '#64748b', fontWeight: 600 }}>{gameName}</div>
        <div style={{ fontSize: '88px', fontWeight: 900, color: '#7c3aed', lineHeight: 1, marginTop: '4px' }}>
          {score}
        </div>
        <div style={{ fontSize: '24px', color: '#94a3b8', marginBottom: '40px' }}>bodov</div>

        <div style={{ fontSize: '28px', color: '#374151', fontWeight: 700, marginBottom: '20px' }}>
          Zadaj svoje meno:
        </div>

        {/* Text input */}
        <div style={{ width: '100%', maxWidth: '680px', position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            maxLength={MAX}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Tvoje meno..."
            style={{
              width: '100%',
              fontSize: '36px',
              fontWeight: 700,
              padding: '28px 32px',
              borderRadius: '20px',
              border: `3px solid ${name.trim() ? '#7c3aed' : '#e2e8f0'}`,
              outline: 'none',
              color: '#1e293b',
              background: '#f8fafc',
              boxSizing: 'border-box',
              boxShadow: name.trim() ? '0 0 0 6px rgba(124,58,237,0.12)' : 'none',
              transition: 'all 0.15s',
            }}
          />
          <div style={{
            position: 'absolute',
            right: '20px',
            bottom: '12px',
            fontSize: '18px',
            color: name.length > MAX * 0.8 ? '#ef4444' : '#cbd5e1',
            fontWeight: 600,
          }}>
            {name.length}/{MAX}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          disabled={!canSubmit}
          style={{
            marginTop: '32px',
            width: '100%',
            maxWidth: '680px',
            padding: '30px',
            fontSize: '28px',
            fontWeight: 900,
            background: canSubmit ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#e2e8f0',
            color: canSubmit ? '#fff' : '#94a3b8',
            border: 'none',
            borderRadius: '22px',
            cursor: canSubmit ? 'pointer' : 'default',
            boxShadow: canSubmit ? '0 6px 24px rgba(124,58,237,0.35)' : 'none',
            letterSpacing: '0.04em',
            transition: 'all 0.15s',
          }}
        >
          {phase === 'submitting' ? '⏳ Ukladám...' : '✓ ULOŽIŤ SKÓRE'}
        </button>

        <button
          onClick={onDone}
          style={{
            marginTop: '18px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '22px',
            cursor: 'pointer',
            padding: '12px 32px',
          }}
        >
          Preskočiť
        </button>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(0,0,0,0.78)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modal: React.CSSProperties = {
  background: '#fff',
  borderRadius: '36px',
  padding: '52px 56px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '860px',
  boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
};

const confirmBtn: React.CSSProperties = {
  marginTop: '48px',
  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
  color: '#fff',
  fontSize: '32px',
  fontWeight: 900,
  padding: '32px 88px',
  borderRadius: '22px',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 6px 28px rgba(124,58,237,0.45)',
  letterSpacing: '0.04em',
};
