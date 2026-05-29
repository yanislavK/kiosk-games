import type { VercelRequest, VercelResponse } from '@vercel/node';

// Proxy for Overpass API – browser GET requests often hit 406 WAF blocks;
// server-to-server POST with proper headers works reliably.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { query } = req.body as { query?: string };
  if (!query) return res.status(400).json({ error: 'Missing query in body' });

  try {
    const upstream = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'KioskBratislava/1.0 (educational kiosk; contact: kiosk@example.sk)',
      },
      body: 'data=' + encodeURIComponent(query),
      signal: AbortSignal.timeout(12000),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return res.status(upstream.status).json({ error: `Overpass returned ${upstream.status}`, detail: text.slice(0, 200) });
    }

    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Failed to reach Overpass', detail: String(e) });
  }
}
