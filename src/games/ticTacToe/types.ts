export type Cell = 'X' | 'O' | null;
export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];
export type Player = 'X' | 'O';
export type GameMode = 'ai' | 'pvp';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  winningLine: number[] | null;
  mode: GameMode;
  score: { X: number; O: number; draws: number };
  isAiThinking: boolean;
}
