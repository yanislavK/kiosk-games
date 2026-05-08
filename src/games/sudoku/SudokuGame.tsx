import React, { useState, useEffect, useRef } from 'react';
import { generatePuzzle } from './generator';
import type { Difficulty } from './generator';

interface Props {
  difficulty: Difficulty;
  onBack: () => void;
  onGameEnd?: (score: number) => void;
}

const BASE_SCORE: Record<Difficulty, number> = { easy: 1000, medium: 2000, hard: 3000 };
const MAX_MISTAKES = 3;
const CELL = 90; // cell size in px
// grid total width = 9*CELL + 3 thick-left (3px each) + 6 thin-left (1px each) + 1 thick-right (3px) = 810+18 = 828
const GRID_W = CELL * 9 + 18;

export default function SudokuGame(props: Props) {
  const [genKey, setGenKey] = useState(0);
  return <GameCore key={genKey} {...props} onRetry={() => setGenKey(k => k + 1)} />;
}

function GameCore({ difficulty, onBack, onGameEnd, onRetry }: Props & { onRetry: () => void }) {
  const [{ puzzle, solution }] = useState(() => generatePuzzle(difficulty));
  const [board, setBoard] = useState<number[][]>(() => puzzle.map(r => [...r]));
  const given = puzzle.map(row => row.map(val => val !== 0));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [phase, setPhase] = useState<'playing' | 'solved' | 'failed'>('playing');
  const firedRef = useRef(false);

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const inputNum = (n: number) => {
    if (!selected || phase !== 'playing') return;
    const [r, c] = selected;
    if (given[r][c]) return;

    const next = board.map(row => [...row]);
    next[r][c] = n;
    setBoard(next);

    if (n !== 0 && n !== solution[r][c]) {
      const m = mistakes + 1;
      setMistakes(m);
      if (m >= MAX_MISTAKES) setPhase('failed');
      return;
    }

    if (n !== 0 && !firedRef.current) {
      const done = next.every((row, ri) => row.every((cell, ci) => cell === solution[ri][ci]));
      if (done) {
        firedRef.current = true;
        setPhase('solved');
        const score = Math.max(100, BASE_SCORE[difficulty] - seconds * 2 - mistakes * 50);
        onGameEnd?.(score);
      }
    }
  };

  const selR = selected?.[0] ?? -1;
  const selC = selected?.[1] ?? -1;
  const selNum = selR >= 0 && selC >= 0 ? board[selR][selC] : 0;

  const cellBg = (r: number, c: number): string => {
    if (r === selR && c === selC) return '#ede9fe';
    const isErr = !given[r][c] && board[r][c] !== 0 && board[r][c] !== solution[r][c];
    if (isErr) return '#fee2e2';
    if (selNum > 0 && board[r][c] === selNum) return '#ddd6fe';
    if (selR >= 0 && (r === selR || c === selC ||
      (Math.floor(r / 3) === Math.floor(selR / 3) && Math.floor(c / 3) === Math.floor(selC / 3)))) {
      return '#f1f5f9';
    }
    return given[r][c] ? '#f8fafc' : '#fff';
  };

  const cellColor = (r: number, c: number): string => {
    if (r === selR && c === selC) return '#7c3aed';
    if (!given[r][c] && board[r][c] !== 0 && board[r][c] !== solution[r][c]) return '#dc2626';
    return given[r][c] ? '#1e293b' : '#0f766e';
  };

  const numpadGap = 12;
  const numpadKeyW = Math.floor((GRID_W - numpadGap * 4) / 5);

  if (phase !== 'playing') {
    const solved = phase === 'solved';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '28px', padding: '60px 40px' }}>
        <div style={{ fontSize: '110px', lineHeight: 1 }}>{solved ? '🎉' : '💔'}</div>
        <div style={{ fontSize: '56px', fontWeight: 900, color: solved ? '#0f766e' : '#dc2626', letterSpacing: '0.02em' }}>
          {solved ? 'VYRIEŠENÉ!' : 'KONIEC HRY'}
        </div>
        {solved && (
          <div style={{ fontSize: '30px', color: '#64748b', fontWeight: 600 }}>
            {fmt(seconds)} · {mistakes} {mistakes === 1 ? 'chyba' : mistakes < 5 ? 'chyby' : 'chýb'}
          </div>
        )}
        {!solved && (
          <div style={{ fontSize: '28px', color: '#64748b' }}>Použil si 3 chyby</div>
        )}
        <button
          onPointerDown={() => onRetry()}
          style={{ marginTop: '12px', background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#fff', fontSize: '32px', fontWeight: 900, padding: '28px 80px', borderRadius: '20px', border: 'none', cursor: 'pointer', boxShadow: '0 6px 24px rgba(15,118,110,0.4)', letterSpacing: '0.04em', touchAction: 'none' }}
        >
          HRAŤ ZNOVA
        </button>
        <button
          onPointerDown={() => onBack()}
          style={{ background: '#f1f5f9', color: '#64748b', fontSize: '26px', fontWeight: 700, padding: '22px 60px', borderRadius: '18px', border: '2px solid #e2e8f0', cursor: 'pointer', touchAction: 'none' }}
        >
          ← SPÄŤ
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '20px 0', gap: '16px', overflowY: 'auto' }}>

      {/* Status bar */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch', width: `${GRID_W}px` }}>
        <div style={statusCard}>
          <span style={{ fontSize: '15px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Čas</span>
          <span style={{ fontSize: '34px', fontWeight: 900, color: '#1e293b', fontVariantNumeric: 'tabular-nums' }}>{fmt(seconds)}</span>
        </div>
        <div style={{ ...statusCard, flex: 1 }}>
          <span style={{ fontSize: '15px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Chyby</span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {Array.from({ length: MAX_MISTAKES }, (_, i) => (
              <span key={i} style={{ fontSize: '30px', lineHeight: 1 }}>{i < mistakes ? '❌' : '⭕'}</span>
            ))}
          </div>
        </div>
        <button
          onPointerDown={() => onBack()}
          style={{ background: '#f1f5f9', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '0 28px', fontSize: '22px', fontWeight: 700, color: '#64748b', cursor: 'pointer', touchAction: 'none' }}
        >
          ← SPÄŤ
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
        {board.map((row, r) => (
          <div key={r} style={{ display: 'flex' }}>
            {row.map((cell, c) => (
              <div
                key={c}
                onPointerDown={(e) => { e.preventDefault(); setSelected([r, c]); }}
                style={{
                  width: `${CELL}px`,
                  height: `${CELL}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '38px',
                  fontWeight: given[r][c] ? 800 : 500,
                  color: cellColor(r, c),
                  background: cellBg(r, c),
                  borderTop: r % 3 === 0 ? '3px solid #374151' : '1px solid #cbd5e1',
                  borderLeft: c % 3 === 0 ? '3px solid #374151' : '1px solid #cbd5e1',
                  borderRight: c === 8 ? '3px solid #374151' : 'none',
                  borderBottom: r === 8 ? '3px solid #374151' : 'none',
                  cursor: 'pointer',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'none',
                  transition: 'background 0.08s',
                  boxSizing: 'content-box',
                }}
              >
                {cell !== 0 ? cell : ''}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Numpad */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${numpadGap}px`, width: `${GRID_W}px` }}>
        {[[1, 2, 3, 4, 5], [6, 7, 8, 9, 0]].map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: `${numpadGap}px` }}>
            {row.map((n) => (
              <NumKey
                key={n}
                label={n === 0 ? '⌫' : String(n)}
                width={numpadKeyW}
                onTap={() => inputNum(n)}
                color={n === 0 ? '#fef2f2' : '#fff'}
                textColor={n === 0 ? '#dc2626' : '#1e293b'}
              />
            ))}
          </div>
        ))}
      </div>

    </div>
  );
}

const statusCard: React.CSSProperties = {
  background: '#fff',
  border: '2px solid #e2e8f0',
  borderRadius: '16px',
  padding: '12px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '6px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
};

function NumKey({ label, width, onTap, color, textColor }: {
  label: string; width: number; onTap: () => void; color: string; textColor: string;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onPointerDown={(e) => { e.preventDefault(); setPressed(true); onTap(); }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: `${width}px`,
        height: '110px',
        flexShrink: 0,
        background: color,
        border: '2px solid #e2e8f0',
        borderRadius: '16px',
        fontSize: '44px',
        fontWeight: 800,
        color: textColor,
        cursor: 'pointer',
        boxShadow: pressed ? 'none' : '0 4px 0 #d1d5db',
        transform: pressed ? 'translateY(3px)' : 'none',
        transition: 'transform 0.06s, box-shadow 0.06s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
    >
      {label}
    </button>
  );
}
