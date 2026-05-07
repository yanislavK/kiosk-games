import type { Board, Player } from './types';

export const WINNING_LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

export function checkWinner(board: Board): { winner: Player | null; line: number[] | null } {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line };
    }
  }
  return { winner: null, line: null };
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

export function emptyBoard(): Board {
  return [null, null, null, null, null, null, null, null, null];
}

// Minimax with alpha-beta pruning for optimal AI play
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: Player,
  humanPlayer: Player
): number {
  const { winner } = checkWinner(board);
  if (winner === aiPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const next = [...board] as Board;
        next[i] = aiPlayer;
        best = Math.max(best, minimax(next, depth + 1, false, alpha, beta, aiPlayer, humanPlayer));
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const next = [...board] as Board;
        next[i] = humanPlayer;
        best = Math.min(best, minimax(next, depth + 1, true, alpha, beta, aiPlayer, humanPlayer));
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

export function getBestMove(board: Board, aiPlayer: Player): number {
  const humanPlayer: Player = aiPlayer === 'O' ? 'X' : 'O';
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const next = [...board] as Board;
      next[i] = aiPlayer;
      const score = minimax(next, 0, false, -Infinity, Infinity, aiPlayer, humanPlayer);
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}
