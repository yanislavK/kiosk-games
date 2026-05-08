import React, { useState } from 'react';
import { submitScore } from '../lib/api';

interface Props {
  gameId: string;
  score: number;
  gameName: string;
  onDone: () => void;
}

type Phase = 'input' | 'submitting' | 'done';

const MAX = 50;

const SPECIAL = ['Á','Č','Ď','É','Í','Ľ','Ň','Ó','Ô','Ŕ','Š','Ť','Ú','Ý','Ž'];
const ROW1    = ['Q','W','E','R','T','Y','U','I','O','P'];
const ROW2    = ['A','S','D','F','G','H','J','K','L'];
const ROW3    = ['Z','X','C','V','B','N','M'];

export default function PlayerNameModal({ gameId, score, gameName, onDone }: Props) {
  const [name, setName]   = useState('');
  const [caps, setCaps]   = useState(true);
  const [phase, setPhase] = useState<Phase>('input');
  const [rank, setRank]   = useState<number | null>(null);

  const add = (char: string) => {
    if (name.length >= MAX) return;
    setName((p) => p + char);
  };
  const del = () => setName((p) => p.slice(0, -1));
  const space = () => { if (name.length < MAX) setName((p) => p + ' '); };

  const key = (l: string) => caps ? l : l.toLowerCase();

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed || phase !== 'input') return;
    setPhase('submitting');
    const result = await submitScore(gameId, trimmed, score);
    setRank(result?.rank ?? null);
    setPhase('done');
  };

  /* ── DONE screen ─────────────────────────────────────── */
  if (phase === 'done') {
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏆';
    return (
      <div style={overlay}>
        <div style={{ ...modal, gap: '12px' }}>
          <div style={{ fontSize: '100px', lineHeight: 1 }}>{medal}</div>
          <div style={{ fontSize: '44px', fontWeight: 900, color: '#1e293b' }}>
            {rank != null ? `#${rank} MIESTO!` : 'ULOŽENÉ!'}
          </div>
          {rank != null && rank <= 3 && (
            <div style={{ fontSize: '26px', color: '#7c3aed', fontWeight: 700 }}>
              {rank === 1 ? 'PRVÉ MIESTO!' : rank === 2 ? 'DRUHÉ MIESTO!' : 'TRETIE MIESTO!'}
            </div>
          )}
          {rank != null && rank > 3 && rank <= 10 && (
            <div style={{ fontSize: '26px', color: '#0891b2', fontWeight: 700 }}>TOP 10!</div>
          )}
          <div style={{ fontSize: '26px', color: '#64748b', fontWeight: 600 }}>
            {name.trim()} · {score} bodov
          </div>
          <button onClick={onDone} style={confirmBtn}>POKRAČOVAŤ →</button>
        </div>
      </div>
    );
  }

  /* ── INPUT screen ────────────────────────────────────── */
  const canSubmit = name.trim().length > 0 && phase === 'input';

  return (
    <div style={overlay}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
      <div style={modal}>

        {/* Score header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
          <div style={{ fontSize: '22px', color: '#94a3b8', fontWeight: 600 }}>{gameName}</div>
          <div style={{ fontSize: '40px', fontWeight: 900, color: '#7c3aed', lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: '20px', color: '#94a3b8' }}>bodov</div>
        </div>

        {/* Display field */}
        <div style={{
          width: '100%',
          minHeight: '76px',
          background: '#f8fafc',
          border: '3px solid #7c3aed',
          borderRadius: '16px',
          padding: '14px 20px',
          fontSize: '32px',
          fontWeight: 700,
          color: '#1e293b',
          boxShadow: '0 0 0 6px rgba(124,58,237,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          marginBottom: '16px',
          letterSpacing: '0.02em',
          wordBreak: 'break-all',
        }}>
          <span>
            {name}
            <span style={{ animation: 'blink 1s step-start infinite', color: '#7c3aed', fontWeight: 900 }}>|</span>
          </span>
          <span style={{ fontSize: '16px', color: name.length > MAX * 0.8 ? '#ef4444' : '#cbd5e1', fontWeight: 600, flexShrink: 0, marginLeft: '8px' }}>
            {name.length}/{MAX}
          </span>
        </div>

        {/* ── Keyboard ──────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', width: '100%', marginBottom: '16px' }}>

          {/* Slovak special chars */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            {SPECIAL.map((l) => (
              <KbKey key={l} label={caps ? l : l.toLowerCase()} w={50} h={58} onTap={() => add(caps ? l : l.toLowerCase())} color="#ede9fe" textColor="#7c3aed" />
            ))}
          </div>

          {/* Row 1 */}
          <div style={{ display: 'flex', gap: '7px', justifyContent: 'center' }}>
            {ROW1.map((l) => (
              <KbKey key={l} label={key(l)} w={75} h={75} onTap={() => add(key(l))} />
            ))}
          </div>

          {/* Row 2 */}
          <div style={{ display: 'flex', gap: '7px', justifyContent: 'center' }}>
            {ROW2.map((l) => (
              <KbKey key={l} label={key(l)} w={75} h={75} onTap={() => add(key(l))} />
            ))}
          </div>

          {/* Row 3: Caps + letters + Backspace */}
          <div style={{ display: 'flex', gap: '7px', justifyContent: 'center' }}>
            <KbKey label={caps ? '⇧' : '⇩'} w={114} h={75} onTap={() => setCaps((c) => !c)}
              color={caps ? '#7c3aed' : '#f1f5f9'} textColor={caps ? '#fff' : '#64748b'} />
            {ROW3.map((l) => (
              <KbKey key={l} label={key(l)} w={75} h={75} onTap={() => add(key(l))} />
            ))}
            <KbKey label="⌫" w={114} h={75} onTap={del} color="#fef2f2" textColor="#dc2626" />
          </div>

          {/* Row 4: Space + hyphen */}
          <div style={{ display: 'flex', gap: '7px', justifyContent: 'center' }}>
            <KbKey label="MEDZERA" w={580} h={75} onTap={space} color="#f1f5f9" textColor="#374151" fontSize={22} />
            <KbKey label="-" w={75} h={75} onTap={() => add('-')} />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
          <button
            onClick={submit}
            disabled={!canSubmit}
            style={{
              flex: 1,
              padding: '26px',
              fontSize: '26px',
              fontWeight: 900,
              background: canSubmit ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#e2e8f0',
              color: canSubmit ? '#fff' : '#94a3b8',
              border: 'none',
              borderRadius: '18px',
              cursor: canSubmit ? 'pointer' : 'default',
              boxShadow: canSubmit ? '0 6px 20px rgba(124,58,237,0.35)' : 'none',
              letterSpacing: '0.04em',
            }}
          >
            {phase === 'submitting' ? '⏳ Ukladám...' : '✓ ULOŽIŤ SKÓRE'}
          </button>
          <button
            onClick={onDone}
            style={{
              padding: '26px 32px',
              fontSize: '22px',
              fontWeight: 700,
              background: '#f1f5f9',
              color: '#94a3b8',
              border: 'none',
              borderRadius: '18px',
              cursor: 'pointer',
            }}
          >
            Preskočiť
          </button>
        </div>

      </div>
    </div>
  );
}

/* ── Key component ───────────────────────────────────────── */
interface KbKeyProps {
  label: string;
  w: number;
  h: number;
  onTap: () => void;
  color?: string;
  textColor?: string;
  fontSize?: number;
}
function KbKey({ label, w, h, onTap, color = '#fff', textColor = '#1e293b', fontSize = 28 }: KbKeyProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onPointerDown={(e) => { e.preventDefault(); setPressed(true); onTap(); }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: `${w}px`,
        height: `${h}px`,
        flexShrink: 0,
        background: color,
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: `${fontSize}px`,
        fontWeight: 800,
        color: textColor,
        cursor: 'pointer',
        boxShadow: pressed ? 'none' : '0 3px 0 #d1d5db',
        transform: pressed ? 'translateY(2px)' : 'none',
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

/* ── Styles ──────────────────────────────────────────────── */
const overlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(0,0,0,0.82)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modal: React.CSSProperties = {
  background: '#fff',
  borderRadius: '32px',
  padding: '32px 32px 28px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '940px',
  boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
};

const confirmBtn: React.CSSProperties = {
  marginTop: '24px',
  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
  color: '#fff',
  fontSize: '32px',
  fontWeight: 900,
  padding: '28px 80px',
  borderRadius: '20px',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 6px 28px rgba(124,58,237,0.45)',
  letterSpacing: '0.04em',
};
