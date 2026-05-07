import type { Card, CardDef, Difficulty, GridConfig } from './types';
import { GRID_CONFIGS } from './types';

export const ALL_LANDMARKS: CardDef[] = [
  { pairId: 'radnica',  label: 'RADNICA',  icon: '🏛️', color: '#2563eb', bg: '#dbeafe' },
  { pairId: 'zamok',    label: 'ZÁMOK',    icon: '🏰', color: '#7c3aed', bg: '#ede9fe' },
  { pairId: 'fontana',  label: 'FONTÁNA',  icon: '⛲', color: '#0891b2', bg: '#cffafe' },
  { pairId: 'kostol',   label: 'KOSTOL',   icon: '⛪', color: '#ea580c', bg: '#ffedd5' },
  { pairId: 'most',     label: 'MOST SNP', icon: '🌉', color: '#16a34a', bg: '#dcfce7' },
  { pairId: 'park',     label: 'PARK',     icon: '🌳', color: '#65a30d', bg: '#f7fee7' },
  { pairId: 'muzeum',   label: 'MÚZEUM',   icon: '🎨', color: '#b45309', bg: '#fef3c7' },
  { pairId: 'divadlo',  label: 'DIVADLO',  icon: '🎭', color: '#be185d', bg: '#fce7f3' },
  { pairId: 'socha',    label: 'SOCHA',    icon: '🗿', color: '#6b7280', bg: '#f3f4f6' },
  { pairId: 'namestie', label: 'NÁMESTIE', icon: '🏙️', color: '#0f766e', bg: '#ccfbf1' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildCards(difficulty: Difficulty): Card[] {
  const config: GridConfig = GRID_CONFIGS[difficulty];
  const selected = ALL_LANDMARKS.slice(0, config.pairs);
  const doubled = [...selected, ...selected];
  const shuffled = shuffle(doubled);
  return shuffled.map((def, i) => ({
    uid: `${def.pairId}-${i}`,
    pairId: def.pairId,
    label: def.label,
    icon: def.icon,
    color: def.color,
    bg: def.bg,
    isFlipped: false,
    isMatched: false,
  }));
}

export function calcStars(moves: number, totalPairs: number, seconds: number): number {
  const ideal = totalPairs + Math.floor(totalPairs * 0.5);
  const timeLimit = totalPairs * 8;
  if (moves <= ideal && seconds <= timeLimit) return 3;
  if (moves <= ideal * 1.6 && seconds <= timeLimit * 1.8) return 2;
  return 1;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
