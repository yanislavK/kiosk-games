import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const GAMES = ['quiz', 'mathquiz', 'trafficquiz', 'stack', 'memory', 'puzzle', 'sudoku'];

function getPrisma() {
  return new PrismaClient();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const prisma = getPrisma();

  try {
    if (req.method === 'GET') {
      const { game } = req.query;

      if (game && typeof game === 'string') {
        if (!GAMES.includes(game)) return res.status(400).json({ error: 'invalid game' });

        const rows = await prisma.score.findMany({
          where: { gameId: game },
          orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
          take: 20,
          select: { playerName: true, score: true, createdAt: true },
        });

        return res.status(200).json({
          entries: rows.map((r) => ({
            player_name: r.playerName,
            score: r.score,
            created_at: r.createdAt,
          })),
        });
      }

      // All games top 10
      const results: Record<string, unknown[]> = {};
      for (const g of GAMES) {
        const rows = await prisma.score.findMany({
          where: { gameId: g },
          orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
          take: 10,
          select: { playerName: true, score: true, createdAt: true },
        });
        results[g] = rows.map((r) => ({
          player_name: r.playerName,
          score: r.score,
          created_at: r.createdAt,
        }));
      }
      return res.status(200).json({ games: results });
    }

    if (req.method === 'POST') {
      const { gameId, playerName, score } = req.body ?? {};

      if (!GAMES.includes(gameId)) return res.status(400).json({ error: 'invalid game' });

      const clean = String(playerName ?? '').trim().slice(0, 50);
      if (!clean) return res.status(400).json({ error: 'invalid name' });

      const s = Number(score);
      if (!Number.isFinite(s) || s < 0 || s > 999999) return res.status(400).json({ error: 'invalid score' });
      const si = Math.round(s);

      await prisma.score.create({ data: { gameId, playerName: clean, score: si } });

      const above = await prisma.score.count({ where: { gameId, score: { gt: si } } });
      return res.status(200).json({ rank: above + 1 });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('scores api error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
