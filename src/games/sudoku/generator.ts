export type Difficulty = 'easy' | 'medium' | 'hard';

function isValid(board: number[][], row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c++) if (board[row][c] === num) return false;
  for (let r = 0; r < 9; r++) if (board[r][col] === num) return false;
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (board[br + r][bc + c] === num) return false;
  return true;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fill(board: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fill(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

const REMOVE: Record<Difficulty, number> = { easy: 36, medium: 46, hard: 54 };

export function generatePuzzle(difficulty: Difficulty): { puzzle: number[][], solution: number[][] } {
  const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
  fill(board);
  const solution = board.map(r => [...r]);

  const cells = shuffle(Array.from({ length: 81 }, (_, i) => i));
  const target = REMOVE[difficulty];
  for (let i = 0; i < target; i++) {
    board[Math.floor(cells[i] / 9)][cells[i] % 9] = 0;
  }

  return { puzzle: board, solution };
}
