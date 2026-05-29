import type { VercelRequest, VercelResponse } from '@vercel/node';

// Proxy for imhd.sk API (no CORS headers on their side)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { endpoint, ...params } = req.query as Record<string, string>;
  if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });

  const qs = new URLSearchParams(params).toString();
  const url = `https://imhd.sk/ba/api/1/${endpoint}${qs ? '?' + qs : ''}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, */*',
        'Referer': 'https://imhd.sk/',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `imhd.sk returned ${upstream.status}` });
    }

    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Failed to reach imhd.sk', detail: String(e) });
  }
}
