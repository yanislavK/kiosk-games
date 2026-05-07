export type Difficulty = 'easy' | 'medium' | 'hard';
export type Operation = '+' | '−' | '×' | '÷';

export interface DiffConfig {
  label: string;
  sublabel: string;
  emoji: string;
  timeLimit: number;
  example: string;
}

export const DIFF_CONFIGS: Record<Difficulty, DiffConfig> = {
  easy:   { label: 'ĽAHKÉ',   sublabel: 'Sčítanie a odčítanie', emoji: '😊', timeLimit: 15, example: '8 + 5 = ?' },
  medium: { label: 'STREDNÉ', sublabel: 'Násobenie a delenie',  emoji: '🤔', timeLimit: 12, example: '7 × 8 = ?' },
  hard:   { label: 'ŤAŽKÉ',   sublabel: 'Zmiešané príklady',   emoji: '🧠', timeLimit: 8,  example: '? + 14 = 37' },
};

export interface MathQuestion {
  display: QuestionPart[];
  answer: number;
  choices: number[];
  operation: Operation;
}

export type QuestionPart =
  | { type: 'number'; value: number }
  | { type: 'op';     value: string }
  | { type: 'equals' }
  | { type: 'blank' };

export interface MathQuizState {
  questions: MathQuestion[];
  currentIndex: number;
  selectedChoice: number | null;
  answered: boolean;
  timeLeft: number;
  score: number;
  streak: number;
  maxStreak: number;
  finished: boolean;
}
