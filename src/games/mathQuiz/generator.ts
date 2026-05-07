import type { Difficulty, MathQuestion, QuestionPart } from './types';
import { DIFF_CONFIGS } from './types';

const TOTAL = 10;

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function wrongChoices(correct: number, count: number): number[] {
  const wrongs = new Set<number>();
  const deltas = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20]);
  for (const d of deltas) {
    for (const sign of [1, -1]) {
      const w = correct + sign * d;
      if (w !== correct && w >= 0 && !wrongs.has(w)) {
        wrongs.add(w);
        if (wrongs.size === count) return [...wrongs];
      }
    }
  }
  // fallback
  let i = 1;
  while (wrongs.size < count) {
    const w = correct + i;
    if (!wrongs.has(w)) wrongs.add(w);
    i++;
  }
  return [...wrongs];
}

function makeChoices(correct: number): number[] {
  const wrongs = wrongChoices(correct, 3);
  return shuffle([correct, ...wrongs]);
}

function partsResult(left: number, op: string, right: number): QuestionPart[] {
  return [
    { type: 'number', value: left },
    { type: 'op', value: op },
    { type: 'number', value: right },
    { type: 'equals' },
    { type: 'blank' },
  ];
}

/* ── EASY: addition & subtraction 1–20 ── */
function genEasy(): MathQuestion {
  const type = rnd(0, 1);
  if (type === 0) {
    const a = rnd(1, 15), b = rnd(1, 15);
    return { display: partsResult(a, '+', b), answer: a + b, choices: makeChoices(a + b), operation: '+' };
  } else {
    const b = rnd(1, 15), a = rnd(b, 20);
    return { display: partsResult(a, '−', b), answer: a - b, choices: makeChoices(a - b), operation: '−' };
  }
}

/* ── MEDIUM: multiplication, division, harder +/- ── */
function genMedium(): MathQuestion {
  const type = rnd(0, 3);
  if (type === 0) {
    const a = rnd(2, 9), b = rnd(2, 9);
    return { display: partsResult(a, '×', b), answer: a * b, choices: makeChoices(a * b), operation: '×' };
  } else if (type === 1) {
    const b = rnd(2, 9), ans = rnd(2, 9), a = b * ans;
    return { display: partsResult(a, '÷', b), answer: ans, choices: makeChoices(ans), operation: '÷' };
  } else if (type === 2) {
    const a = rnd(10, 50), b = rnd(10, 50);
    return { display: partsResult(a, '+', b), answer: a + b, choices: makeChoices(a + b), operation: '+' };
  } else {
    const b = rnd(5, 40), a = rnd(b + 5, 99);
    return { display: partsResult(a, '−', b), answer: a - b, choices: makeChoices(a - b), operation: '−' };
  }
}

/* ── HARD: missing numbers, large values, mixed ── */
function genHard(): MathQuestion {
  const type = rnd(0, 4);
  if (type === 0) {
    // ? + b = c  →  answer = a
    const a = rnd(5, 50), b = rnd(5, 50);
    const c = a + b;
    return {
      display: [{ type: 'blank' }, { type: 'op', value: '+' }, { type: 'number', value: b }, { type: 'equals' }, { type: 'number', value: c }],
      answer: a, choices: makeChoices(a), operation: '+',
    };
  } else if (type === 1) {
    // a - ? = c
    const b = rnd(5, 40), a = rnd(b + 5, 99);
    const c = a - b;
    return {
      display: [{ type: 'number', value: a }, { type: 'op', value: '−' }, { type: 'blank' }, { type: 'equals' }, { type: 'number', value: c }],
      answer: b, choices: makeChoices(b), operation: '−',
    };
  } else if (type === 2) {
    const a = rnd(6, 15), b = rnd(6, 15);
    return { display: partsResult(a, '×', b), answer: a * b, choices: makeChoices(a * b), operation: '×' };
  } else if (type === 3) {
    // ? × b = c
    const b = rnd(3, 12), a = rnd(3, 12), c = a * b;
    return {
      display: [{ type: 'blank' }, { type: 'op', value: '×' }, { type: 'number', value: b }, { type: 'equals' }, { type: 'number', value: c }],
      answer: a, choices: makeChoices(a), operation: '×',
    };
  } else {
    // a + b + c = ?
    const a = rnd(10, 40), b = rnd(10, 40), c = rnd(5, 20);
    return {
      display: [
        { type: 'number', value: a }, { type: 'op', value: '+' },
        { type: 'number', value: b }, { type: 'op', value: '+' },
        { type: 'number', value: c }, { type: 'equals' }, { type: 'blank' },
      ],
      answer: a + b + c, choices: makeChoices(a + b + c), operation: '+',
    };
  }
}

export function generateQuestions(difficulty: Difficulty): MathQuestion[] {
  const gen = difficulty === 'easy' ? genEasy : difficulty === 'medium' ? genMedium : genHard;
  return Array.from({ length: TOTAL }, gen);
}

export { TOTAL };
export { DIFF_CONFIGS };
