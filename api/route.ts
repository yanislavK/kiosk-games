import type { VercelRequest, VercelResponse } from '@vercel/node';

const SPEED_MPS: Record<string, number> = {
  walk: 1.25, // 4.5 km/h
  bike: 4.2,  // 15 km/h
  car: 10.8,  // 39 km/h city estimate
};

function withModeDuration(data: any, mode: string) {
  const speed = SPEED_MPS[mode];
  if (!speed || !Array.isArray(data.routes)) return data;

  return {
    ...data,
    routes: data.routes.map((route: any) => ({
      ...route,
      duration: Math.round(route.distance / speed),
    })),
  };
}

// Proxy for OSRM routing – tries multiple profile name conventions
// (public OSRM servers disagree: 'walking' vs 'foot', 'cycling' vs 'bike')
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mode, from_lng, from_lat, to_lng, to_lat } = req.query as Record<string, string>;
  if (!mode || !from_lng || !from_lat || !to_lng || !to_lat) {
    return res.status(400).json({ error: 'Missing params: mode, from_lng, from_lat, to_lng, to_lat' });
  }

  const coord = `${from_lng},${from_lat};${to_lng},${to_lat}`;
  const qs    = 'overview=full&geometries=geojson';

  // Different OSRM servers use different profile name conventions.
  // Try all known variants for each mode.
  const attempts: string[] =
    mode === 'walk' ? [
      `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coord}?${qs}`,
      `https://routing.openstreetmap.de/routed-foot/route/v1/walking/${coord}?${qs}`,
      `https://router.project-osrm.org/route/v1/walking/${coord}?${qs}`,
      `https://router.project-osrm.org/route/v1/foot/${coord}?${qs}`,
    ] : mode === 'bike' ? [
      `https://routing.openstreetmap.de/routed-bike/route/v1/bike/${coord}?${qs}`,
      `https://routing.openstreetmap.de/routed-bike/route/v1/cycling/${coord}?${qs}`,
      `https://router.project-osrm.org/route/v1/cycling/${coord}?${qs}`,
      `https://router.project-osrm.org/route/v1/bike/${coord}?${qs}`,
    ] : [
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coord}?${qs}`,
      `https://routing.openstreetmap.de/routed-car/route/v1/car/${coord}?${qs}`,
      `https://router.project-osrm.org/route/v1/driving/${coord}?${qs}`,
      `https://router.project-osrm.org/route/v1/car/${coord}?${qs}`,
    ];

  for (const url of attempts) {
    try {
      const upstream = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'KioskBratislava/1.0' },
      });
      if (!upstream.ok) continue;
      const data = await upstream.json();
      if (data.code === 'Ok' && data.routes?.length) {
        // Cache successful routes for 1 hour (roads don't change often)
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
        return res.json(withModeDuration(data, mode));
      }
    } catch { /* try next */ }
  }

  return res.status(502).json({ error: 'All routing servers unavailable' });
}
