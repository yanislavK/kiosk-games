export interface ScoreEntry {
  player_name: string;
  score: number;
  created_at: string;
}

export async function fetchLeaderboard(gameId: string): Promise<ScoreEntry[]> {
  try {
    const res = await fetch(`/api/scores?game=${encodeURIComponent(gameId)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.entries ?? [];
  } catch {
    return [];
  }
}

export async function fetchAllLeaderboards(): Promise<Record<string, ScoreEntry[]>> {
  try {
    const res = await fetch('/api/scores');
    if (!res.ok) return {};
    const data = await res.json();
    return data.games ?? {};
  } catch {
    return {};
  }
}

export async function submitScore(
  gameId: string,
  playerName: string,
  score: number,
): Promise<{ rank: number } | null> {
  try {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, playerName, score }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
