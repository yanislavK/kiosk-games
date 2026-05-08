import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Difficulty } from './types';
import { BOARD_SIZE, GRID_CONFIGS } from './types';
import { shuffle, isSolved, blankIndex, canMove, applyMove, calcStars, formatTime } from './logic';
import type { PuzzleImage } from './images';

const GAP = 5;

interface Props {
  difficulty: Difficulty;
  image: PuzzleImage;
  onBack: () => void;
  onNewImage: () => void;
  onGameEnd?: (score: number) => void;
}

export default function PuzzleGame({ difficulty, image, onBack, onNewImage, onGameEnd }: Props) {
  const { size } = GRID_CONFIGS[difficulty];
  const tileSize = (BOARD_SIZE - GAP * (size - 1)) / size;

  const [tiles, setTiles] = useState<number[]>(() => shuffle(difficulty));
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [solved, setSolved] = useState(false);
  const [lastMoved, setLastMoved] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    if (solved) {
      if (!calledRef.current) {
        calledRef.current = true;
        const stars = calcStars(moves, size);
        const score = Math.max(0, stars * 1000 - moves * 10 - seconds * 3);
        onGameEnd?.(score);
      }
    } else {
      calledRef.current = false;
    }
  }, [solved, moves, seconds, size, onGameEnd]);

  useEffect(() => {
    if (solved) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [solved]);

  const handleTileClick = useCallback((pos: number) => {
    if (solved) return;
    setTiles((prev) => {
      const bi = blankIndex(prev);
      if (!canMove(bi, pos, size)) return prev;
      const next = applyMove(prev, pos, bi);
      setLastMoved(prev[pos]);
      setMoves((m) => m + 1);
      if (isSolved(next)) setSolved(true);
      return next;
    });
  }, [solved, size]);

  const restart = () => {
    setTiles(shuffle(difficulty));
    setMoves(0);
    setSeconds(0);
    setSolved(false);
    setLastMoved(null);
  };

  const stars = calcStars(moves, size);
  const ImageComp = image.Component;

  if (solved) {
    return (
      <div style={styles.resultWrap}>
        <div style={{ fontSize: '100px', lineHeight: 1, animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>🎉</div>
        <h2 style={{ ...styles.resultTitle, color: '#7c3aed' }}>VÝBORNE!</h2>
        <div style={styles.completedImage}>
          <ImageComp size={360} />
        </div>
        <div style={styles.resultStats}>
          <div style={styles.rStat}><span style={styles.rStatIcon}>⏱️</span><span style={styles.rStatVal}>{formatTime(seconds)}</span><span style={styles.rStatLbl}>Čas</span></div>
          <div style={styles.rStat}><span style={styles.rStatIcon}>🎯</span><span style={styles.rStatVal}>{moves}</span><span style={styles.rStatLbl}>Ťahov</span></div>
          <div style={styles.rStat}>
            <span style={styles.rStatIcon}>⭐</span>
            <span style={styles.rStatVal}>{[1,2,3].map(i=><span key={i} style={{opacity:i<=stars?1:0.2}}>⭐</span>)}</span>
            <span style={styles.rStatLbl}>Hodnotenie</span>
          </div>
        </div>
        <div style={styles.resultActions}>
          <button style={{ ...styles.actionBtn, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }} onClick={restart}>↺ ZNOVA</button>
          <button style={{ ...styles.actionBtn, background: 'linear-gradient(135deg,#16a34a,#15803d)' }} onClick={onNewImage}>🖼️ INÝ OBRÁZOK</button>
          <button style={styles.backBtn} onClick={onBack}>← SPÄŤ</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Stats */}
      <div style={styles.statsBar}>
        <div style={styles.statPill}>⏱️ <strong>{formatTime(seconds)}</strong></div>
        <div style={styles.statCenter}>
          <span style={styles.statCLabel}>ŤAHY</span>
          <span style={styles.statCVal}>{moves}</span>
        </div>
        <div style={styles.statPill}>🖼️ <strong>{image.label}</strong></div>
      </div>

      {/* Board */}
      <div style={{ position: 'relative', width: BOARD_SIZE, height: BOARD_SIZE, flexShrink: 0 }}>
        {/* Solved reference ghost */}
        {showPreview && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, borderRadius: '16px', overflow: 'hidden', opacity: 0.92, boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}>
            <ImageComp size={BOARD_SIZE} />
          </div>
        )}
        {tiles.map((tileNum, pos) => {
          if (tileNum === 0) return null; // blank
          const curRow = Math.floor(pos / size);
          const curCol = pos % size;
          const srcRow = Math.floor((tileNum - 1) / size);
          const srcCol = (tileNum - 1) % size;
          const left = curCol * (tileSize + GAP);
          const top = curRow * (tileSize + GAP);
          const isLast = lastMoved === tileNum;
          const bi = blankIndex(tiles);
          const isMovable = canMove(bi, pos, size);

          return (
            <div
              key={tileNum}
              onClick={() => handleTileClick(pos)}
              style={{
                position: 'absolute',
                left,
                top,
                width: tileSize,
                height: tileSize,
                overflow: 'hidden',
                borderRadius: '8px',
                border: isMovable ? '3px solid rgba(255,255,255,0.9)' : '3px solid rgba(255,255,255,0.4)',
                cursor: isMovable ? 'pointer' : 'default',
                transition: 'left 0.18s cubic-bezier(0.4,0,0.2,1), top 0.18s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: isMovable
                  ? '0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.2)',
                animation: isLast ? 'popIn 0.2s ease both' : undefined,
                zIndex: isMovable ? 2 : 1,
              }}
            >
              <div
                style={{
                  width: BOARD_SIZE,
                  height: BOARD_SIZE,
                  transform: `translate(${-srcCol * (tileSize + GAP)}px, ${-srcRow * (tileSize + GAP)}px)`,
                  pointerEvents: 'none',
                }}
              >
                <ImageComp size={BOARD_SIZE} />
              </div>
              {/* Movable indicator */}
              {isMovable && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '6px',
                  background: 'rgba(255,255,255,0.08)',
                  pointerEvents: 'none',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom controls */}
      <div style={styles.controls}>
        <button
          style={{ ...styles.ctrlBtn, background: showPreview ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#fff', color: showPreview ? '#fff' : '#7c3aed', borderColor: '#c4b5fd' }}
          onPointerDown={() => setShowPreview(true)}
          onPointerUp={() => setShowPreview(false)}
          onPointerLeave={() => setShowPreview(false)}
        >
          👁️ NÁPOVEDA
        </button>
        <button style={{ ...styles.ctrlBtn, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', borderColor: '#7c3aed' }} onClick={restart}>
          ↺ NOVÁ HRA
        </button>
        <button style={{ ...styles.ctrlBtn, borderColor: '#e2e8f0' }} onClick={onBack}>
          ← SPÄŤ
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '16px 24px 24px',
    overflowY: 'auto',
  },
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: BOARD_SIZE,
    gap: '12px',
  },
  statPill: {
    background: '#fff',
    border: '2px solid #e9d5ff',
    borderRadius: '14px',
    padding: '12px 18px',
    fontSize: '18px',
    color: '#7c3aed',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    whiteSpace: 'nowrap',
  },
  statCenter: {
    background: '#fff',
    border: '2px solid #e9d5ff',
    borderRadius: '14px',
    padding: '10px 28px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    flex: 1,
  },
  statCLabel: { display: 'block', fontSize: '14px', fontWeight: 700, color: '#9333ea', letterSpacing: '0.08em' },
  statCVal: { display: 'block', fontSize: '36px', fontWeight: 900, color: '#7c3aed', lineHeight: 1 },
  controls: {
    display: 'flex',
    gap: '14px',
    width: '100%',
    maxWidth: BOARD_SIZE,
  },
  ctrlBtn: {
    flex: 1,
    padding: '22px 12px',
    borderRadius: '16px',
    border: '2px solid',
    fontSize: '20px',
    fontWeight: 800,
    cursor: 'pointer',
    background: '#fff',
    color: '#64748b',
    boxShadow: '0 4px 12px rgba(0,0,0,0.09)',
    letterSpacing: '0.03em',
    transition: 'all 0.12s',
  },
  // Result screen
  resultWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    padding: '32px 56px',
    textAlign: 'center',
    overflowY: 'auto',
  },
  resultTitle: {
    fontSize: '52px',
    fontWeight: 900,
    letterSpacing: '0.06em',
  },
  completedImage: {
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
    border: '4px solid #c4b5fd',
  },
  resultStats: {
    display: 'flex',
    gap: '24px',
    background: '#faf5ff',
    border: '2px solid #e9d5ff',
    borderRadius: '20px',
    padding: '24px 36px',
    width: '100%',
  },
  rStat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  rStatIcon: { fontSize: '36px' },
  rStatVal: { fontSize: '36px', fontWeight: 900, color: '#7c3aed', lineHeight: 1 },
  rStatLbl: { fontSize: '16px', color: '#64748b', fontWeight: 600 },
  resultActions: {
    display: 'flex',
    gap: '14px',
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    color: '#fff',
    fontSize: '22px',
    fontWeight: 800,
    padding: '26px 16px',
    borderRadius: '18px',
    border: 'none',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
    cursor: 'pointer',
  },
  backBtn: {
    flex: 1,
    background: '#fff',
    color: '#64748b',
    fontSize: '22px',
    fontWeight: 700,
    padding: '26px 16px',
    borderRadius: '18px',
    border: '2px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
    cursor: 'pointer',
  },
};
