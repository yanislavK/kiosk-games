export interface Answer {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: number;
  question: string;
  answers: Answer[];
  correctId: 'A' | 'B' | 'C' | 'D';
  funFact: string;
}

export type AnswerState = 'idle' | 'correct' | 'wrong' | 'revealed';

export interface QuizState {
  currentIndex: number;
  selectedId: Answer['id'] | null;
  answerState: AnswerState;
  score: number;
  stars: number;
  hintsUsed: number;
  eliminatedIds: Answer['id'][];
  finished: boolean;
}
