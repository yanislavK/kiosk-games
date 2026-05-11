import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { getBestMove, type Difficulty } from './engine';

type GameMode = 'ai' | '2player';

interface Props {
  mode: GameMode;
  difficulty: Difficulty;
  onGameEnd: (score: number, winner: 'white' | 'black' | 'draw') => void;
  onBack: () => void;
  onRestart: () => void;
}

const UNICODE: Record<string, string> = {
  wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
};

const PROMO_LABELS: Record<string, string> = { q: 'Dáma', r: 'Veža', b: 'Strelec', n: 'Kôň' };
const SCORE_BASE: Record<Difficulty, number> = { easy: 1000, medium: 2000, hard: 3000 };
const CAPTURE_BONUS: Record<string, number> = { p: 10, n: 30, b: 35, r: 50, q: 90 };
const CELL = 120;
const FILES = 'abcdefgh';

interface GameResult {
  winner: 'white' | 'black' | 'draw';
  reason: string;
}

export default function ChessGame({ mode, difficulty, onGameEnd, onBack, onRestart }: Props) {
  const gameRef = useRef(new Chess());
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [promotion, setPromotion] = useState<{ from: string; to: string } | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const endCalledRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const g = gameRef.current;
  const rerender = () => setTick(t => t + 1);

  const endGame = useCallback((res: GameResult) => {
    if (endCalledRef.current) return;
    endCalledRef.current = true;
    setResult(res);

    let score = 0;
    if (mode === 'ai' && res.winner === 'white') {
      const bonus = g.history({ verbose: true })
        .filter(m => m.color === 'w' && m.captured)
        .reduce((s, m) => s + (CAPTURE_BONUS[m.captured!] ?? 0), 0);
      score = SCORE_BASE[difficulty] + bonus;
    } else if (mode === 'ai' && res.winner === 'draw') {
      score = 100;
    }
    onGameEnd(score, res.winner);
  }, [mode, difficulty, g, onGameEnd]);

  const checkEnd = useCallback(() => {
    if (!g.isGameOver()) return false;
    const loser = g.turn();
    if (g.isCheckmate()) {
      endGame({ winner: loser === 'w' ? 'black' : 'white', reason: 'Šachmat' });
    } else if (g.isStalemate()) {
      endGame({ winner: 'draw', reason: 'Pat' });
    } else if (g.isInsufficientMaterial()) {
      endGame({ winner: 'draw', reason: 'Nedostatočný materiál' });
    } else if (g.isThreefoldRepetition()) {
      endGame({ winner: 'draw', reason: 'Trojité opakovanie' });
    } else {
      endGame({ winner: 'draw', reason: 'Remíza' });
    }
    return true;
  }, [g, endGame]);

  const runAi = useCallback(() => {
    setAiThinking(true);
    timerRef.current = setTimeout(() => {
      if (endCalledRef.current) { setAiThinking(false); return; }
      const mv = getBestMove(g, difficulty);
      if (mv) {
        g.move({ from: mv.from, to: mv.to, promotion: mv.promotion ?? 'q' });
        setLastMove({ from: mv.from, to: mv.to });
        rerender();
        checkEnd();
      }
      setAiThinking(false);
    }, 300);
  }, [g, difficulty, checkEnd]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (mode === 'ai' && !endCalledRef.current && g.turn() === 'b' && !aiThinking) {
      runAi();
    }
  }, [tick, mode, aiThinking, g, runAi]);

  const resign = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAiThinking(false);
    const loser = mode === 'ai' ? 'white' : (g.turn() === 'w' ? 'white' : 'black');
    endGame({ winner: loser === 'white' ? 'black' : 'white', reason: 'Vzdanie' });
  };

  const handleClick = (row: number, col: number) => {
    if (result || promotion) return;
    if (mode === 'ai' && (g.turn() === 'b' || aiThinking)) return;

    const sq = FILES[col] + (8 - row);

    if (selected && legalTargets.includes(sq)) {
      const movingPiece = g.get(selected as any);
      if (movingPiece?.type === 'p') {
        const promoting = (movingPiece.color === 'w' && sq[1] === '8') ||
                          (movingPiece.color === 'b' && sq[1] === '1');
        if (promoting) {
          setPromotion({ from: selected, to: sq });
          setSelected(null);
          setLegalTargets([]);
          return;
        }
      }
      g.move({ from: selected, to: sq });
      setLastMove({ from: selected, to: sq });
      setSelected(null);
      setLegalTargets([]);
      rerender();
      checkEnd();
      return;
    }

    const piece = g.get(sq as any);
    if (piece && piece.color === g.turn()) {
      setSelected(sq);
      setLegalTargets(g.moves({ square: sq as any, verbose: true }).map((m: any) => m.to));
    } else {
      setSelected(null);
      setLegalTargets([]);
    }
  };

  const handlePromotion = (p: string) => {
    if (!promotion) return;
    g.move({ from: promotion.from, to: promotion.to, promotion: p });
    setLastMove(promotion);
    setPromotion(null);
    rerender();
    checkEnd();
  };

  const board = g.board();
  const turn = g.turn();
  const inCheck = g.isCheck();

  let kingCheckSq: string | null = null;
  if (inCheck) {
    outer: for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p?.type === 'k' && p.color === turn) { kingCheckSq = FILES[c] + (8 - r); break outer; }
      }
    }
  }

  const turnLabel = mode === '2player'
    ? (turn === 'w' ? '⬜ Biely na ťahu' : '⬛ Čierny na ťahu')
    : (turn === 'w' ? '⬜ Váš ťah' : aiThinking ? '🤖 AI premýšľa...' : '🤖 AI na ťahu');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', padding: '16px 0 28px', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>

      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, width: CELL * 8 + 8 }}>
        <div style={{
          flex: 1, background: inCheck && !result ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.07)',
          borderRadius: 14, padding: '12px 20px',
          border: `2px solid ${inCheck && !result ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 21, fontWeight: 800, color: '#e2e8f0' }}>{turnLabel}</span>
          {inCheck && !result && (
            <span style={{ fontSize: 20, color: '#ef4444', fontWeight: 900, letterSpacing: '0.05em' }}>ŠAH!</span>
          )}
        </div>
        {!result && (
          <button onClick={resign} style={{
            background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '12px 20px', color: '#fca5a5',
            fontSize: 18, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
          }}>
            Vzdať sa
          </button>
        )}
      </div>

      {/* Board */}
      <div style={{ border: '4px solid #7b5528', boxShadow: '0 12px 48px rgba(0,0,0,0.6)', borderRadius: 3 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(8, ${CELL}px)` }}>
          {board.map((row, r) =>
            row.map((cell, c) => {
              const sq = FILES[c] + (8 - r);
              const isLight = (r + c) % 2 === 0;
              const isSel = selected === sq;
              const isTarget = legalTargets.includes(sq);
              const isLastFrom = lastMove?.from === sq;
              const isLastTo = lastMove?.to === sq;
              const isCheckKing = kingCheckSq === sq;

              return (
                <div
                  key={sq}
                  onClick={() => handleClick(r, c)}
                  style={{
                    width: CELL, height: CELL,
                    background: isLight ? '#F0D9B5' : '#B58863',
                    position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: result ? 'default' : 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {(isLastFrom || isLastTo) && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(205,210,106,0.5)' }} />
                  )}
                  {isSel && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,85,30,0.55)' }} />
                  )}
                  {isCheckKing && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(220,50,50,0.7)', borderRadius: '50%' }} />
                  )}
                  {isTarget && !cell && (
                    <div style={{
                      position: 'absolute',
                      width: CELL * 0.33, height: CELL * 0.33,
                      borderRadius: '50%', background: 'rgba(20,85,30,0.45)', zIndex: 1,
                    }} />
                  )}
                  {isTarget && cell && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      border: `${Math.round(CELL * 0.1)}px solid rgba(20,85,30,0.6)`,
                      zIndex: 1, boxSizing: 'border-box',
                    }} />
                  )}
                  {cell && (
                    <span style={{
                      fontSize: 76, lineHeight: 1, position: 'relative', zIndex: 2,
                      color: cell.color === 'w' ? '#fff' : '#1a1a2e',
                      textShadow: cell.color === 'w'
                        ? '0 0 3px #000, 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000'
                        : '0 0 2px rgba(255,255,255,0.5), 1px 1px 0 rgba(255,255,255,0.2)',
                    }}>
                      {UNICODE[`${cell.color}${cell.type}`]}
                    </span>
                  )}
                  {c === 0 && (
                    <span style={{ position: 'absolute', top: 2, left: 3, fontSize: 13, fontWeight: 700, color: isLight ? '#B58863' : '#F0D9B5', zIndex: 3, lineHeight: 1 }}>
                      {8 - r}
                    </span>
                  )}
                  {r === 7 && (
                    <span style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 13, fontWeight: 700, color: isLight ? '#B58863' : '#F0D9B5', zIndex: 3, lineHeight: 1 }}>
                      {FILES[c]}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Promotion dialog */}
      {promotion && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1e293b', border: '2px solid #334155', borderRadius: 24, padding: '32px 40px', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#e2e8f0', marginBottom: 24 }}>Výber figúrky</div>
            <div style={{ display: 'flex', gap: 16 }}>
              {(['q', 'r', 'b', 'n'] as const).map(p => {
                const color = g.turn();
                return (
                  <button key={p} onClick={() => handlePromotion(p)} style={{
                    background: '#0f172a', border: '2px solid #475569', borderRadius: 16,
                    padding: '16px 22px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{
                      fontSize: 68, lineHeight: 1,
                      color: color === 'w' ? '#fff' : '#1a1a2e',
                      textShadow: color === 'w'
                        ? '0 0 3px #000, 1px 1px 0 #000, -1px -1px 0 #000'
                        : '0 0 2px rgba(255,255,255,0.5)',
                    }}>
                      {UNICODE[`${color}${p}`]}
                    </span>
                    <span style={{ fontSize: 15, color: '#94a3b8', fontWeight: 700 }}>{PROMO_LABELS[p]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Game over overlay */}
      {result && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            border: '2px solid #334155', borderRadius: 28,
            padding: '48px 56px', textAlign: 'center', minWidth: 500,
            boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          }}>
            <div style={{ fontSize: 88 }}>
              {result.winner === 'white' ? '♔' : result.winner === 'black' ? '♚' : '🤝'}
            </div>
            <div style={{ fontSize: 42, fontWeight: 900, color: '#f1f5f9', marginTop: 16, lineHeight: 1.2 }}>
              {result.winner === 'draw' ? 'Remíza!'
                : result.winner === 'white' ? 'Biely vyhral!'
                : 'Čierny vyhral!'}
            </div>
            <div style={{ fontSize: 22, color: '#64748b', marginTop: 10 }}>{result.reason}</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 36, justifyContent: 'center' }}>
              <button onClick={onRestart} style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#fff', fontSize: 22, fontWeight: 800,
                padding: '18px 40px', borderRadius: 16, border: 'none',
                cursor: 'pointer', boxShadow: '0 6px 20px rgba(37,99,235,0.4)',
              }}>
                Nová hra
              </button>
              <button onClick={onBack} style={{
                background: 'rgba(255,255,255,0.08)', color: '#e2e8f0',
                fontSize: 22, fontWeight: 700, padding: '18px 40px',
                borderRadius: 16, border: '2px solid rgba(255,255,255,0.14)',
                cursor: 'pointer',
              }}>
                ← Späť
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
