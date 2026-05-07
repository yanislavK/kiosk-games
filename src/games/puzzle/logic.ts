import type { Difficulty } from './types';
import { GRID_CONFIGS } from './types';

/** tiles[i] = tile number (1..n²-1) at position i; 0 = blank */
export function solvedTiles(size: number): number[] {
  return Array.from({ length: size * size }, (_, i) => (i === size * size - 1 ? 0 : i + 1));
}

export function blankIndex(tiles: number[]): number {
  return tiles.indexOf(0);
}

export function adjacentIndices(idx: number, size: number): number[] {
  const r = Math.floor(idx / size), c = idx % size;
  const adj: number[] = [];
  if (r > 0) adj.push(idx - size);
  if (r < size - 1) adj.push(idx + size);
  if (c > 0) adj.push(idx - 1);
  if (c < size - 1) adj.push(idx + 1);
  return adj;
}

export function canMove(blankIdx: number, tileIdx: number, size: number): boolean {
  return adjacentIndices(blankIdx, size).includes(tileIdx);
}

export function applyMove(tiles: number[], tileIdx: number, blankIdx: number): number[] {
  const next = [...tiles];
  [next[tileIdx], next[blankIdx]] = [next[blankIdx], next[tileIdx]];
  return next;
}

export function shuffle(difficulty: Difficulty): number[] {
  const { size, shuffleMoves } = GRID_CONFIGS[difficulty];
  let tiles = solvedTiles(size);
  let prev = -1;
  for (let i = 0; i < shuffleMoves; i++) {
    const bi = blankIndex(tiles);
    const adj = adjacentIndices(bi, size).filter((a) => a !== prev);
    const chosen = adj[Math.floor(Math.random() * adj.length)];
    tiles = applyMove(tiles, chosen, bi);
    prev = bi;
  }
  return tiles;
}

export function isSolved(tiles: number[]): boolean {
  return tiles.every((v, i) => v === (i === tiles.length - 1 ? 0 : i + 1));
}

export function calcStars(moves: number, size: number): number {
  const ideal = size * size * 3;
  if (moves <= ideal) return 3;
  if (moves <= ideal * 1.8) return 2;
  return 1;
}

export function formatTime(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
