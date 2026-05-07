export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GridConfig {
  cols: number;
  rows: number;
  pairs: number;
  label: string;
  sublabel: string;
}

export const GRID_CONFIGS: Record<Difficulty, GridConfig> = {
  easy:   { cols: 3, rows: 4, pairs: 6,  label: 'ĽAHKÉ',   sublabel: '3×4' },
  medium: { cols: 4, rows: 4, pairs: 8,  label: 'STREDNÉ', sublabel: '4×4' },
  hard:   { cols: 4, rows: 5, pairs: 10, label: 'ŤAŽKÉ',   sublabel: '4×5' },
};

export interface CardDef {
  pairId: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
}

export interface Card {
  uid: string;       // unique per card instance
  pairId: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MemoryState {
  cards: Card[];
  flippedUids: string[];  // at most 2 at a time
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  finished: boolean;
  seconds: number;
}
