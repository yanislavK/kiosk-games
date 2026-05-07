export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GridConfig {
  size: number;
  label: string;
  sublabel: string;
  shuffleMoves: number;
}

export const GRID_CONFIGS: Record<Difficulty, GridConfig> = {
  easy:   { size: 3, label: 'ĽAHKÉ',   sublabel: '3×3', shuffleMoves: 40  },
  medium: { size: 4, label: 'STREDNÉ', sublabel: '4×4', shuffleMoves: 100 },
  hard:   { size: 5, label: 'ŤAŽKÉ',   sublabel: '5×5', shuffleMoves: 200 },
};

export const BOARD_SIZE = 720; // px
