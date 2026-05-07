import React, { useState, useEffect, useCallback } from 'react';
import type { Board, GameMode, GameState, Player } from './types';
import { checkWinner, emptyBoard, getBestMove, isBoardFull } from './logic';

interface Props {
  initialMode: GameMode;
  onBack: () => void;
}

function initState(mode: GameMode): GameState {
  return {
    board: emptyBoard(),
    currentPlayer: 'X',
    winner: null,
    winningLine: null,
    mode,
    score: { X: 0, O: 0, draws: 0 },
    isAiThinking: false,
  };
}

export default function TicTacToeGame({ initialMode, onBack }: Props) {
  const [state, setState] = useState<GameState>(() => initState(initialMode));
  const [animatedCells, setAnimatedCells] = useState<Set<number>>(new Set());

  const handleCellClick = useCallback((index: number) => {
    setState((prev) => {
      if (prev.board[index] !== null || prev.winner !== null || prev.isAiThinking) return prev;
      const newBoard = [...prev.board] as Board;
      newBoard[index] = prev.currentPlayer;

      setAnimatedCells((s) => new Set([...s, index]));

      const { winner, line } = checkWinner(newBoard);
      if (winner) {
        return {
          ...prev,
          board: newBoard,
          winner,
          winningLine: line,
          score: { ...prev.score, [winner]: prev.score[winner] + 1 },
          isAiThinking: false,
        };
      }
      if (isBoardFull(newBoard)) {
        return {
          ...prev,
          board: newBoard,
          winner: 'draw',
          winningLine: null,
          score: { ...prev.score, draws: prev.score.draws + 1 },
          isAiThinking: false,
        };
      }
      const next: Player = prev.currentPlayer === 'X' ? 'O' : 'X';
      return {
        ...prev,
        board: newBoard,
        currentPlayer: next,
        isAiThinking: prev.mode === 'ai' && next === 'O',
      };
    });
  }, []);

  // AI move
  useEffect(() => {
    if (state.mode !== 'ai' || !state.isAiThinking || state.winner !== null) return;
    const timer = setTimeout(() => {
      const move = getBestMove(state.board, 'O');
      if (move !== -1) handleCellClick(move);
    }, 500);
    return () => clearTimeout(timer);
  }, [state.isAiThinking, state.board, state.winner, state.mode, handleCellClick]);

  const restart = () => {
    setAnimatedCells(new Set());
    setState((prev) => ({
      ...initState(prev.mode),
      score: prev.score,
    }));
  };

  const { board, currentPlayer, winner, winningLine, score, isAiThinking, mode } = state;

  const statusText = () => {
    if (winner === 'draw') return 'REMÍZA!';
    if (winner) {
      if (mode === 'ai') return winner === 'X' ? 'Vyhral si!' : 'AI vyhralo!';
      return `Hráč ${winner} VYHRAL!`;
    }
    if (isAiThinking) return 'AI premýšľa...';
    if (mode === 'ai') return currentPlayer === 'X' ? 'Tvoj ťah' : 'Ťah AI';
    return `Hráč ${currentPlayer} – NA ŤAHU`;
  };

  const statusColor = winner
    ? winner === 'draw'
      ? '#64748b'
      : winner === 'X'
      ? '#2563eb'
      : '#16a34a'
    : '#1e293b';

  return (
    <div style={styles.container}>
      {/* Score panel */}
      <div style={styles.scorePanel}>
        <div style={{ ...styles.scoreBox, borderColor: '#2563eb' }}>
          <div style={{ ...styles.scoreLabel, color: '#2563eb' }}>
            {mode === 'ai' ? 'TY (X)' : 'HRÁČ X'}
          </div>
          <div style={{ ...styles.scoreValue, color: '#2563eb' }}>{score.X}</div>
        </div>
        <div style={styles.scoreBox}>
          <div style={{ ...styles.scoreLabel, color: '#64748b' }}>REMÍZY</div>
          <div style={{ ...styles.scoreValue, color: '#64748b' }}>{score.draws}</div>
        </div>
        <div style={{ ...styles.scoreBox, borderColor: '#16a34a' }}>
          <div style={{ ...styles.scoreLabel, color: '#16a34a' }}>
            {mode === 'ai' ? 'AI (O)' : 'HRÁČ O'}
          </div>
          <div style={{ ...styles.scoreValue, color: '#16a34a' }}>{score.O}</div>
        </div>
      </div>

      {/* Status */}
      <div style={{ ...styles.status, color: statusColor }}>
        {statusText()}
      </div>

      {/* Board */}
      <div style={styles.boardWrapper}>
        <div style={styles.board}>
          {board.map((cell, i) => {
            const isWinCell = winningLine?.includes(i);
            const isAnimated = animatedCells.has(i);
            return (
              <button
                key={i}
                style={{
                  ...styles.cell,
                  ...(isWinCell ? styles.cellWin : {}),
                  cursor: cell || winner || isAiThinking ? 'default' : 'pointer',
                }}
                onClick={() => handleCellClick(i)}
                disabled={!!cell || !!winner || isAiThinking}
              >
                {cell && (
                  <span
                    style={{
                      ...styles.cellMark,
                      color: cell === 'X' ? '#2563eb' : '#16a34a',
                      animation: isAnimated ? 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
                    }}
                  >
                    {cell === 'X' ? '×' : '○'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div style={styles.actions}>
        <button style={styles.btnRestart} onClick={restart}>
          <span style={styles.btnIcon}>↺</span> NOVÁ HRA
        </button>
        <button style={styles.btnBack} onClick={onBack}>
          <span style={styles.btnIcon}>←</span> SPÄŤ
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '32px',
    padding: '0 40px',
    flex: 1,
    justifyContent: 'center',
  },
  scorePanel: {
    display: 'flex',
    gap: '16px',
    width: '100%',
    maxWidth: '700px',
  },
  scoreBox: {
    flex: 1,
    background: '#fff',
    borderRadius: '20px',
    padding: '20px 16px',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    border: '3px solid #e2e8f0',
  },
  scoreLabel: {
    fontSize: '18px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  scoreValue: {
    fontSize: '52px',
    fontWeight: 900,
    lineHeight: 1,
  },
  status: {
    fontSize: '36px',
    fontWeight: 800,
    letterSpacing: '0.02em',
    textAlign: 'center',
    minHeight: '48px',
    transition: 'color 0.3s',
  },
  boardWrapper: {
    width: '100%',
    maxWidth: '700px',
    display: 'flex',
    justifyContent: 'center',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    width: '100%',
    aspectRatio: '1',
    background: 'linear-gradient(135deg, #e0eaff 0%, #f0fdf4 100%)',
    borderRadius: '28px',
    padding: '20px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
  },
  cell: {
    background: '#fff',
    borderRadius: '20px',
    border: '3px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: '1',
    transition: 'all 0.15s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cellWin: {
    background: 'linear-gradient(135deg, #dbeafe, #dcfce7)',
    border: '3px solid #2563eb',
    boxShadow: '0 0 24px rgba(37,99,235,0.3)',
    animation: 'winGlow 1.5s ease-in-out infinite',
  },
  cellMark: {
    fontSize: '120px',
    fontWeight: 900,
    lineHeight: 1,
    display: 'block',
  },
  actions: {
    display: 'flex',
    gap: '20px',
    width: '100%',
    maxWidth: '700px',
  },
  btnRestart: {
    flex: 2,
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#fff',
    fontSize: '28px',
    fontWeight: 800,
    padding: '28px 24px',
    borderRadius: '20px',
    boxShadow: '0 6px 24px rgba(37,99,235,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    letterSpacing: '0.04em',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
  btnBack: {
    flex: 1,
    background: '#fff',
    color: '#1e293b',
    fontSize: '24px',
    fontWeight: 700,
    padding: '28px 20px',
    borderRadius: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    border: '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    letterSpacing: '0.03em',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
  btnIcon: {
    fontSize: '28px',
  },
};
