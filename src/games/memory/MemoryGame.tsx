import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Card, Difficulty, MemoryState } from './types';
import { GRID_CONFIGS } from './types';
import { buildCards, calcStars, formatTime } from './logic';

interface Props {
  difficulty: Difficulty;
  onBack: () => void;
}

function initState(difficulty: Difficulty): MemoryState {
  const config = GRID_CONFIGS[difficulty];
  return {
    cards: buildCards(difficulty),
    flippedUids: [],
    moves: 0,
    matchedPairs: 0,
    totalPairs: config.pairs,
    finished: false,
    seconds: 0,
  };
}

export default function MemoryGame({ difficulty, onBack }: Props) {
  const [state, setState] = useState<MemoryState>(() => initState(difficulty));
  const [blocked, setBlocked] = useState(false);
  const [newlyMatched, setNewlyMatched] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (state.finished) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setState((prev) => ({ ...prev, seconds: prev.seconds + 1 }));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.finished]);

  const handleCardClick = useCallback((uid: string) => {
    if (blocked) return;
    setState((prev) => {
      const card = prev.cards.find((c) => c.uid === uid);
      if (!card || card.isFlipped || card.isMatched) return prev;
      if (prev.flippedUids.length === 2) return prev;

      const newFlipped = [...prev.flippedUids, uid];
      const newCards = prev.cards.map((c) =>
        c.uid === uid ? { ...c, isFlipped: true } : c
      );

      if (newFlipped.length === 2) {
        const [uidA, uidB] = newFlipped;
        const cardA = newCards.find((c) => c.uid === uidA)!;
        const cardB = newCards.find((c) => c.uid === uidB)!;
        const isMatch = cardA.pairId === cardB.pairId;

        if (isMatch) {
          const matched = newCards.map((c) =>
            c.uid === uidA || c.uid === uidB ? { ...c, isMatched: true } : c
          );
          const newMatchedCount = prev.matchedPairs + 1;
          setNewlyMatched((s) => new Set([...s, cardA.pairId]));
          setTimeout(() => setNewlyMatched((s) => { const n = new Set(s); n.delete(cardA.pairId); return n; }), 700);
          return {
            ...prev,
            cards: matched,
            flippedUids: [],
            moves: prev.moves + 1,
            matchedPairs: newMatchedCount,
            finished: newMatchedCount === prev.totalPairs,
          };
        } else {
          // Wrong pair — flip back after delay
          setBlocked(true);
          setTimeout(() => {
            setState((s) => ({
              ...s,
              cards: s.cards.map((c) =>
                c.uid === uidA || c.uid === uidB ? { ...c, isFlipped: false } : c
              ),
              flippedUids: [],
            }));
            setBlocked(false);
          }, 900);
          return {
            ...prev,
            cards: newCards,
            flippedUids: newFlipped,
            moves: prev.moves + 1,
          };
        }
      }

      return { ...prev, cards: newCards, flippedUids: newFlipped };
    });
  }, [blocked]);

  const restart = () => {
    setBlocked(false);
    setNewlyMatched(new Set());
    setState(initState(difficulty));
  };

  const { cards, moves, matchedPairs, totalPairs, finished, seconds } = state;
  const config = GRID_CONFIGS[difficulty];
  const stars = calcStars(moves, totalPairs, seconds);

  if (finished) {
    return <ResultScreen moves={moves} seconds={seconds} stars={stars} totalPairs={totalPairs} onRestart={restart} onBack={onBack} />;
  }

  const cardSize = config.cols === 3 ? 270 : config.cols === 4 ? 200 : 190;
  const gap = 16;

  return (
    <div style={styles.container}>
      {/* Stats bar */}
      <div style={styles.statsBar}>
        <div style={styles.statBox}>
          <span style={styles.statIcon}>⏱️</span>
          <span style={styles.statVal}>{formatTime(seconds)}</span>
        </div>
        <div style={styles.statCenter}>
          <div style={styles.statCenterLabel}>POČET ŤAHOV</div>
          <div style={styles.statCenterVal}>{moves}</div>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statIcon}>⭐</span>
          <span style={styles.statVal}>{matchedPairs}/{totalPairs}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${(matchedPairs / totalPairs) * 100}%` }} />
      </div>

      {/* Card grid */}
      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: `repeat(${config.cols}, ${cardSize}px)`,
          gap: `${gap}px`,
        }}
      >
        {cards.map((card) => (
          <MemoryCard
            key={card.uid}
            card={card}
            size={cardSize}
            isNewlyMatched={newlyMatched.has(card.pairId)}
            onClick={() => handleCardClick(card.uid)}
          />
        ))}
      </div>

      {/* Bottom actions */}
      <div style={styles.bottomRow}>
        <button style={styles.btnRestart} onClick={restart}>↺ NOVÁ HRA</button>
        <button style={styles.btnBack} onClick={onBack}>← SPÄŤ</button>
      </div>
    </div>
  );
}

interface CardProps {
  card: Card;
  size: number;
  isNewlyMatched: boolean;
  onClick: () => void;
}

function MemoryCard({ card, size, isNewlyMatched, onClick }: CardProps) {
  const isVisible = card.isFlipped || card.isMatched;

  return (
    <div
      style={{
        width: size,
        height: size * 1.15,
        perspective: '600px',
        cursor: card.isMatched ? 'default' : 'pointer',
      }}
      onClick={onClick}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          transform: isVisible ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Back face */}
        <div style={{
          ...cardFace,
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          border: '3px solid #bbf7d0',
        }}>
          <div style={backPattern}>
            <span style={{ fontSize: size * 0.28, opacity: 0.6 }}>🏙️</span>
          </div>
        </div>

        {/* Front face */}
        <div style={{
          ...cardFace,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: card.bg,
          border: `3px solid ${card.color}`,
          boxShadow: isNewlyMatched
            ? `0 0 28px ${card.color}88, 0 4px 16px rgba(0,0,0,0.1)`
            : card.isMatched
            ? `0 0 16px ${card.color}44, 0 4px 12px rgba(0,0,0,0.08)`
            : '0 4px 12px rgba(0,0,0,0.1)',
          animation: isNewlyMatched ? 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' : undefined,
        }}>
          <span style={{ fontSize: size * 0.35, lineHeight: 1 }}>{card.icon}</span>
          <span style={{ fontSize: size * 0.14, fontWeight: 800, color: card.color, letterSpacing: '0.04em', marginTop: '6px' }}>
            {card.label}
          </span>
          {card.isMatched && (
            <div style={{ position: 'absolute', top: 8, right: 8, fontSize: size * 0.14 }}>✅</div>
          )}
        </div>
      </div>
    </div>
  );
}

const cardFace: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

const backPattern: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
};

interface ResultProps {
  moves: number;
  seconds: number;
  stars: number;
  totalPairs: number;
  onRestart: () => void;
  onBack: () => void;
}

function ResultScreen({ moves, seconds, stars, totalPairs, onRestart, onBack }: ResultProps) {
  const emoji = stars === 3 ? '🏆' : stars === 2 ? '🥈' : '🥉';
  const msgs = [
    'Skvelé! Výborná pamäť!',
    'Dobre! Takmer dokonalé!',
    'Dobrý pokus! Skúste znova!',
  ];
  const msg = msgs[3 - stars] ?? msgs[2];

  return (
    <div style={styles.resultContainer}>
      <div style={{ fontSize: '110px', lineHeight: 1, animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>{emoji}</div>
      <h2 style={{ fontSize: '48px', fontWeight: 900, color: '#16a34a', letterSpacing: '0.06em' }}>VÝSLEDOK!</h2>

      <div style={styles.resultStats}>
        <div style={styles.resultStat}>
          <span style={{ fontSize: '40px' }}>⏱️</span>
          <span style={styles.resultStatVal}>{formatTime(seconds)}</span>
          <span style={styles.resultStatLabel}>Čas</span>
        </div>
        <div style={styles.resultStat}>
          <span style={{ fontSize: '40px' }}>🎯</span>
          <span style={styles.resultStatVal}>{moves}</span>
          <span style={styles.resultStatLabel}>Ťahov</span>
        </div>
        <div style={styles.resultStat}>
          <span style={{ fontSize: '40px' }}>🃏</span>
          <span style={styles.resultStatVal}>{totalPairs}</span>
          <span style={styles.resultStatLabel}>Párov</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        {[1, 2, 3].map((i) => (
          <span key={i} style={{ fontSize: '56px', opacity: i <= stars ? 1 : 0.2 }}>⭐</span>
        ))}
      </div>

      <p style={{ fontSize: '26px', color: '#475569', textAlign: 'center', lineHeight: 1.5 }}>{msg}</p>

      <div style={{ display: 'flex', gap: '20px', width: '100%', marginTop: '8px' }}>
        <button style={styles.btnRestartResult} onClick={onRestart}>↺ HRAŤ ZNOVA</button>
        <button style={styles.btnBackResult} onClick={onBack}>← SPÄŤ</button>
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
    padding: '20px 32px 28px',
    overflowY: 'auto',
  },
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '900px',
    gap: '16px',
  },
  statBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#fff',
    borderRadius: '16px',
    padding: '16px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '2px solid #bbf7d0',
  },
  statIcon: { fontSize: '26px' },
  statVal: { fontSize: '26px', fontWeight: 800, color: '#16a34a' },
  statCenter: {
    textAlign: 'center',
    background: '#fff',
    borderRadius: '16px',
    padding: '12px 32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '2px solid #bbf7d0',
    flex: 1,
  },
  statCenterLabel: { fontSize: '16px', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' },
  statCenterVal: { fontSize: '42px', fontWeight: 900, color: '#16a34a', lineHeight: 1 },
  progressTrack: {
    width: '100%',
    maxWidth: '900px',
    height: '10px',
    background: '#bbf7d0',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #16a34a, #22c55e)',
    borderRadius: '99px',
    transition: 'width 0.5s ease',
  },
  grid: {
    display: 'grid',
    justifyContent: 'center',
  },
  bottomRow: {
    display: 'flex',
    gap: '16px',
    width: '100%',
    maxWidth: '900px',
    marginTop: 'auto',
  },
  btnRestart: {
    flex: 2,
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: '#fff',
    fontSize: '26px',
    fontWeight: 800,
    padding: '26px 24px',
    borderRadius: '18px',
    border: 'none',
    boxShadow: '0 6px 20px rgba(22,163,74,0.35)',
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
  btnBack: {
    flex: 1,
    background: '#fff',
    color: '#64748b',
    fontSize: '22px',
    fontWeight: 700,
    padding: '26px 20px',
    borderRadius: '18px',
    border: '2px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
    cursor: 'pointer',
  },
  resultContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    padding: '40px 64px',
    textAlign: 'center',
  },
  resultStats: {
    display: 'flex',
    gap: '24px',
    background: '#f0fdf4',
    borderRadius: '24px',
    padding: '28px 40px',
    border: '2px solid #bbf7d0',
    width: '100%',
  },
  resultStat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  resultStatVal: {
    fontSize: '44px',
    fontWeight: 900,
    color: '#16a34a',
    lineHeight: 1,
  },
  resultStatLabel: {
    fontSize: '18px',
    color: '#64748b',
    fontWeight: 600,
  },
  btnRestartResult: {
    flex: 2,
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: '#fff',
    fontSize: '28px',
    fontWeight: 800,
    padding: '30px 24px',
    borderRadius: '20px',
    border: 'none',
    boxShadow: '0 6px 24px rgba(22,163,74,0.4)',
    cursor: 'pointer',
  },
  btnBackResult: {
    flex: 1,
    background: '#fff',
    color: '#64748b',
    fontSize: '24px',
    fontWeight: 700,
    padding: '30px 24px',
    borderRadius: '20px',
    border: '2px solid #e2e8f0',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    cursor: 'pointer',
  },
};
