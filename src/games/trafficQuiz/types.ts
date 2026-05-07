import type React from 'react';

export interface TrafficAnswer {
  id: 'A' | 'B' | 'C';
  text: string;
}

export interface TrafficQuestion {
  id: number;
  question: string;
  Sign: React.FC<{ size?: number }>;
  answers: TrafficAnswer[];
  correctId: 'A' | 'B' | 'C';
  explanation: string;
}

export interface TrafficQuizState {
  currentIndex: number;
  selectedId: TrafficAnswer['id'] | null;
  answered: boolean;
  score: number;
  finished: boolean;
}
