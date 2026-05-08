import React, { useState } from 'react';
import { submitScore } from '../lib/api';

interface Props {
  gameId: string;
  score: number;
  gameName: string;
  onDone: () => void;
}

const ROWS = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
  ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z'],
];

type Phase = 'input' | 'submitting' | 'done';

export default function PlayerNameModal({ gameId, score, gameName, onDone }: Props) {
  const [letters, setLetters] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('input');
  const [rank, setRank] = useState<number | null>(null);

  const add = (l: string) => {
    if (letters.length < 3) setLetters((p) => [...p, l]);
  };
  const del = () => setLetters((p) => p.slice(0, -1));

  const submit = async () => {
    if (letters.length === 0 || phase !== 'input') return;
    setPhase('submitting');
    const result = await submitScore(gameId, letters.join(''), score);
    setRank(result?.rank ?? null);
    setPhase('done');
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
            <div style={{ fontSize: '28px', color: '#0891b2', fontWeight: 700, marginTop: '8px' }}>
              TOP 10!
            </div>
          )}
          <div style={{ fontSize: '30px', color: '#64748b', marginTop: '12px', fontWeight: 600 }}>
            {letters.join('')} · {score} bodov
          </div>
          <button
            onClick={onDone}
            style={{
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
            }}
          >
            POKRAČOVAŤ →
          </button>
        </div>
      </div>
    );
  }

  const full = letters.length >= 3;

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ fontSize: '26px', color: '#64748b', fontWeight: 600 }}>{gameName}</div>
        <div style={{ fontSize: '88px', fontWeight: 900, color: '#7c3aed', lineHeight: 1, marginTop: '4px' }}>
          {score}
        </div>
        <div style={{ fontSize: '24px', color: '#94a3b8', marginBottom: '32px' }}>bodov</div>

        <div style={{ fontSize: '28px', color: '#374151', fontWeight: 700, marginBottom: '20px' }}>
          Zadaj svoje iniciály:
        </div>

        {/* Letter slots */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '36px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '120px',
                height: '136px',
                background: i < letters.length ? '#ede9fe' : '#f8fafc',
                border: `4px solid ${i === letters.length ? '#7c3aed' : i < letters.length ? '#c4b5fd' : '#e2e8f0'}`,
                borderRadius: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '72px',
                fontWeight: 900,
                color: i < letters.length ? '#7c3aed' : '#cbd5e1',
                transition: 'all 0.15s',
                boxShadow: i === letters.length ? '0 0 0 8px rgba(124,58,237,0.12)' : 'none',
              }}
            >
              {i < letters.length ? letters[i] : '·'}
            </div>
          ))}
        </div>

        {/* Keyboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {ROWS.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {row.map((l) => (
                <button
                  key={l}
                  onClick={() => add(l)}
                  disabled={full}
                  style={{
                    width: '96px',
                    height: '90px',
                    fontSize: '32px',
                    fontWeight: 800,
                    background: full ? '#f8fafc' : '#fff',
                    border: `2px solid ${full ? '#f1f5f9' : '#e2e8f0'}`,
                    borderRadius: '14px',
                    color: full ? '#d1d5db' : '#1e293b',
                    cursor: full ? 'default' : 'pointer',
                    boxShadow: full ? 'none' : '0 2px 6px rgba(0,0,0,0.06)',
                    transition: 'all 0.1s',
                  }}
                >
                  {l}
                </button>
              ))}
              {ri === ROWS.length - 1 && (
                <button
                  onClick={del}
                  disabled={letters.length === 0}
                  style={{
                    width: '96px',
                    height: '90px',
                    fontSize: '32px',
                    fontWeight: 800,
                    background: letters.length === 0 ? '#f8fafc' : '#fef2f2',
                    border: `2px solid ${letters.length === 0 ? '#f1f5f9' : '#fca5a5'}`,
                    borderRadius: '14px',
                    color: letters.length === 0 ? '#d1d5db' : '#dc2626',
                    cursor: letters.length === 0 ? 'default' : 'pointer',
                    boxShadow: letters.length === 0 ? 'none' : '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  ⌫
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          disabled={letters.length === 0 || phase === 'submitting'}
          style={{
            width: '560px',
            padding: '30px',
            fontSize: '28px',
            fontWeight: 900,
            background:
              letters.length === 0
                ? '#e2e8f0'
                : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: letters.length === 0 ? '#94a3b8' : '#fff',
            border: 'none',
            borderRadius: '22px',
            cursor: letters.length === 0 ? 'default' : 'pointer',
            boxShadow: letters.length > 0 ? '0 6px 24px rgba(124,58,237,0.35)' : 'none',
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
  padding: '48px 44px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '900px',
  boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
};
