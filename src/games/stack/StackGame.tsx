import { useRef, useState, useEffect } from 'react';
import type { CSSProperties } from 'react';

const GW = 800;
const GH = 1660;
const BLOCK_H = 64;
const GROUND_H = 80;
const INIT_W = 280;
const PERFECT_TOLERANCE = 3;
const TOP_PAD = 280;
const BASE_SPD = 3;
const MAX_SPD = 11;
const WORLD = 50000;

const PALETTE = [
  '#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6',
  '#a855f7','#ec4899','#f43f5e','#f97316','#f59e0b',
  '#84cc16','#22c55e','#10b981','#14b8a6','#0891b2',
];
const col = (i: number) => PALETTE[i % PALETTE.length];

const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: ((i * 137.508) % 1 + (i % 7) * 0.1) * GW,
  y: ((i * 97.33 + i * i * 0.07) % 1) * GH,
  r: 0.6 + (i % 4) * 0.5,
  o: 0.15 + (i % 6) * 0.07,
}));

interface Block { x: number; w: number; }
interface FallingBlock extends Block { wy: number; vy: number; colorIndex: number; }
type Phase = 'idle' | 'playing' | 'over';

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export default function StackGame({ onBack, onGameEnd }: { onBack: () => void; onGameEnd?: (score: number) => void }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    try { const v = localStorage.getItem('stack_best'); return v ? parseInt(v, 10) : 0; }
    catch { return 0; }
  });
  const [isNewBest, setIsNewBest] = useState(false);
  const [showPerfect, setShowPerfect] = useState(false);
  const calledRef = useRef(false);

  useEffect(() => {
    if (phase === 'over') {
      if (!calledRef.current) { calledRef.current = true; onGameEnd?.(score); }
    } else if (phase === 'playing') {
      calledRef.current = false;
    }
  }, [phase, score, onGameEnd]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blocksRef = useRef<Block[]>([]);
  const fallingRef = useRef<FallingBlock[]>([]);
  const mxRef = useRef(0);
  const mwRef = useRef(INIT_W);
  const dirRef = useRef<1 | -1>(1);
  const spdRef = useRef(BASE_SPD);
  const phaseRef = useRef<Phase>('idle');
  const scoreRef = useRef(0);
  const rafRef = useRef(0);
  const perfTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const N = blocksRef.current.length;
    // Ground-anchored cam keeps the ground near the bottom until the tower is tall enough
    // to push it off-screen, at which point the follow-cam takes over.
    const groundCam  = WORLD - GH + GROUND_H;
    const followCam  = WORLD - (N + 1) * BLOCK_H - TOP_PAD;
    const cam = Math.min(groundCam, followCam);
    const sy = (wy: number) => wy - cam;

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, GH);
    bg.addColorStop(0, '#020617');
    bg.addColorStop(0.6, '#0f172a');
    bg.addColorStop(1, '#1e293b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, GW, GH);

    // Stars
    for (const s of STARS) {
      ctx.globalAlpha = s.o;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Ground platform
    const groundY = sy(WORLD);
    if (groundY < GH) {
      const gg = ctx.createLinearGradient(0, groundY, 0, groundY + GROUND_H);
      gg.addColorStop(0, '#475569');
      gg.addColorStop(1, '#334155');
      ctx.fillStyle = gg;
      ctx.fillRect(0, groundY, GW, GROUND_H);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(GW, groundY);
      ctx.stroke();
    }

    // Placed blocks
    for (let i = 0; i < N; i++) {
      const b = blocksRef.current[i];
      const by = sy(WORLD - (i + 1) * BLOCK_H);
      if (by > GH || by + BLOCK_H < 0) continue;
      const c = col(i);
      ctx.shadowColor = c;
      ctx.shadowBlur = 14;
      ctx.fillStyle = c;
      rr(ctx, b.x, by, b.w, BLOCK_H - 4, 8);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.13)';
      rr(ctx, b.x + 6, by + 5, b.w - 12, 14, 5);
      ctx.fill();
    }

    // Falling trimmed pieces
    for (const b of fallingRef.current) {
      const by = sy(b.wy);
      if (by > GH || by + BLOCK_H < 0) continue;
      const c = col(b.colorIndex);
      ctx.shadowColor = c;
      ctx.shadowBlur = 12;
      ctx.fillStyle = c;
      rr(ctx, b.x, by, b.w, BLOCK_H - 4, 8);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Moving block
    if (phaseRef.current === 'playing') {
      const mx = mxRef.current;
      const mw = mwRef.current;
      const my = sy(WORLD - (N + 1) * BLOCK_H);
      const mc = col(N);
      ctx.shadowColor = mc;
      ctx.shadowBlur = 32;
      ctx.fillStyle = mc;
      rr(ctx, mx, my, mw, BLOCK_H - 4, 8);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Score
      const sc = scoreRef.current;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = '900 104px system-ui, sans-serif';
      ctx.fillText(String(sc), GW / 2, 118);
      ctx.shadowBlur = 0;

      if (sc === 0) {
        ctx.font = '700 28px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('TAP!', GW / 2, 158);
      }
    }
  }

  function loop() {
    if (phaseRef.current !== 'playing') return;
    const mw = mwRef.current;
    mxRef.current += spdRef.current * dirRef.current;
    if (dirRef.current === -1 && mxRef.current <= -mw) {
      mxRef.current = -mw;
      dirRef.current = 1;
    } else if (dirRef.current === 1 && mxRef.current >= GW) {
      mxRef.current = GW;
      dirRef.current = -1;
    }
    fallingRef.current = fallingRef.current
      .map(b => ({ ...b, wy: b.wy + b.vy, vy: b.vy + 0.75 }))
      .filter(b => b.wy < WORLD + GH);
    draw();
    rafRef.current = requestAnimationFrame(loop);
  }

  function startGame() {
    const base: Block = { x: (GW - INIT_W) / 2, w: INIT_W };
    blocksRef.current = [base];
    fallingRef.current = [];
    // Start just off-screen so a rushed first tap is a true miss.
    mxRef.current = GW;
    mwRef.current = INIT_W;
    dirRef.current = -1;
    spdRef.current = BASE_SPD;
    scoreRef.current = 0;
    phaseRef.current = 'playing';
    setScore(0);
    setIsNewBest(false);
    setShowPerfect(false);
    setPhase('playing');
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }

  function handleTap() {
    if (phaseRef.current === 'idle') { startGame(); return; }
    if (phaseRef.current !== 'playing') return;

    cancelAnimationFrame(rafRef.current);

    const blocks = blocksRef.current;
    const top = blocks[blocks.length - 1];
    const mx = mxRef.current;
    const mw = mwRef.current;

    const ol = Math.max(mx, top.x);
    const or_ = Math.min(mx + mw, top.x + top.w);
    const ow = or_ - ol;

    if (ow <= 0) {
      fallingRef.current = [{
        x: mx,
        w: mw,
        wy: WORLD - (blocks.length + 1) * BLOCK_H,
        vy: 10,
        colorIndex: blocks.length,
      }];
      phaseRef.current = 'over';
      const sc = scoreRef.current;
      draw();
      setPhase('over');
      setScore(sc);
      const newBest = sc > best;
      setIsNewBest(newBest);
      setBest(prev => {
        const nb = Math.max(prev, sc);
        try { localStorage.setItem('stack_best', String(nb)); } catch { /* ignore */ }
        return nb;
      });
      return;
    }

    const isPerfect = Math.abs(ow - top.w) <= PERFECT_TOLERANCE;
    const newBlock: Block = isPerfect ? { x: top.x, w: top.w } : { x: ol, w: ow };
    const colorIndex = blocks.length;
    const layerWy = WORLD - (blocks.length + 1) * BLOCK_H;

    if (!isPerfect) {
      if (mx < ol) {
        fallingRef.current = [
          ...fallingRef.current,
          { x: mx, w: ol - mx, wy: layerWy, vy: 8, colorIndex },
        ];
      }
      if (mx + mw > or_) {
        fallingRef.current = [
          ...fallingRef.current,
          { x: or_, w: mx + mw - or_, wy: layerWy, vy: 8, colorIndex },
        ];
      }
    }

    blocksRef.current = [...blocks, newBlock];
    scoreRef.current = blocksRef.current.length - 1;
    setScore(scoreRef.current);

    if (isPerfect) {
      setShowPerfect(true);
      if (perfTimerRef.current) clearTimeout(perfTimerRef.current);
      perfTimerRef.current = setTimeout(() => setShowPerfect(false), 900);
    }

    const nextW = newBlock.w;
    // Spawn off-screen from alternating sides, matching the classic Stack cadence.
    if (dirRef.current === 1) {
      // Was moving right, next comes from the right.
      mxRef.current = GW;
      dirRef.current = -1;
    } else {
      // Was moving left, next comes from the left.
      mxRef.current = -nextW;
      dirRef.current = 1;
    }
    mwRef.current = nextW;
    spdRef.current = Math.min(BASE_SPD + scoreRef.current * 0.14, MAX_SPD);

    rafRef.current = requestAnimationFrame(loop);
  }

  useEffect(() => {
    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (perfTimerRef.current) clearTimeout(perfTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{ position: 'relative', width: GW, height: GH, cursor: 'pointer', userSelect: 'none', touchAction: 'none', borderRadius: '16px', overflow: 'hidden' }}
      onPointerDown={e => { e.preventDefault(); handleTap(); }}
    >
      <canvas ref={canvasRef} width={GW} height={GH} style={{ display: 'block' }} />

      {showPerfect && (
        <div style={perfectStyle}>⭐ PERFECT!</div>
      )}

      {phase === 'idle' && (
        <div style={overlayStyle}>
          <div style={{ fontSize: '88px', marginBottom: '8px' }}>🏗️</div>
          <div style={{ fontSize: '68px', fontWeight: 900, color: '#fff', letterSpacing: '0.06em' }}>STACK</div>
          <div style={{ fontSize: '26px', color: '#94a3b8', marginTop: '20px', textAlign: 'center', lineHeight: 1.65, maxWidth: '520px' }}>
            Poskladaj čo najvyššiu vežu!<br />
            <span style={{ fontSize: '21px', opacity: 0.7 }}>Každý nepresný blok sa oreže — buď presný!</span>
          </div>
          <div style={{ marginTop: '56px', background: 'linear-gradient(135deg,#06b6d4,#0891b2)', color: '#fff', fontSize: '32px', fontWeight: 900, padding: '24px 72px', borderRadius: '20px', letterSpacing: '0.05em', boxShadow: '0 8px 32px rgba(6,182,212,0.5)' }}>
            ▶ HRAŤ
          </div>
          <button
            style={{ marginTop: '28px', background: 'transparent', color: '#64748b', fontSize: '22px', fontWeight: 600, padding: '14px 44px', borderRadius: '14px', border: '2px solid #334155', cursor: 'pointer' }}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onBack(); }}
          >
            ← SPÄŤ
          </button>
        </div>
      )}

      {phase === 'over' && (
        <div style={overlayStyle}>
          <div style={{ fontSize: '72px' }}>🏗️</div>
          <div style={{ fontSize: '52px', fontWeight: 900, color: '#f43f5e', marginTop: '8px' }}>KONIEC HRY</div>
          <div style={{ fontSize: '128px', fontWeight: 900, color: '#fff', lineHeight: 1, marginTop: '8px' }}>{score}</div>
          <div style={{ fontSize: '26px', color: '#94a3b8' }}>blokov</div>
          {isNewBest && score > 0 && (
            <div style={{ fontSize: '30px', color: '#f59e0b', fontWeight: 900, marginTop: '10px' }}>⭐ NOVÝ REKORD!</div>
          )}
          <div style={{ fontSize: '20px', color: '#64748b', marginTop: '6px' }}>Rekord: {best}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '52px', width: '400px' }}>
            <button
              style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)', color: '#fff', fontSize: '28px', fontWeight: 900, padding: '22px', borderRadius: '16px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 24px rgba(6,182,212,0.45)' }}
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); startGame(); }}
            >
              🔄 HRAŤ ZNOVA
            </button>
            <button
              style={{ background: 'transparent', color: '#94a3b8', fontSize: '22px', fontWeight: 600, padding: '16px', borderRadius: '14px', border: '2px solid #334155', cursor: 'pointer' }}
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onBack(); }}
            >
              ← MENU
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(1.15); }
        }
      `}</style>
    </div>
  );
}

const overlayStyle: CSSProperties = {
  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', zIndex: 10,
  background: 'rgba(2,6,23,0.88)',
};

const perfectStyle: CSSProperties = {
  position: 'absolute', top: 168, left: 0, right: 0, textAlign: 'center',
  fontSize: '52px', fontWeight: 900, color: '#f59e0b', pointerEvents: 'none',
  textShadow: '0 0 24px #f59e0b, 0 0 48px #f59e0b66',
  animation: 'floatUp 0.9s ease-out forwards',
  zIndex: 5,
};
