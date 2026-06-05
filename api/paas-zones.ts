import type { VercelRequest, VercelResponse } from '@vercel/node';

const ARCGIS_URL =
  'https://nest-proxy.bratislava.sk/geoportal/hSite/rest/services/parkovanie/ODP/MapServer/3';

// Convert EPSG:3857 (Web Mercator) → EPSG:4326 (WGS84)
function merc2ll(x: number, y: number): [number, number] {
  const lng = (x * 180) / 20037508.342;
  const lat = (Math.atan(Math.exp((y * Math.PI) / 20037508.342)) * 360) / Math.PI - 90;
  return [lat, lng]; // [lat, lng] for Leaflet
}

// Real PAAS zone metadata — district prefix → display info
const ZONE_META: Record<string, { color: string; price: number; name: string; hours: string }> = {
  SM0:   { color: '#be123c', price: 2.00, name: 'Staré Mesto – centrum',  hours: 'Po–Ne 8:00–22:00' },
  SM0X1: { color: '#be123c', price: 2.00, name: 'Staré Mesto – centrum X1', hours: 'Po–Ne 8:00–22:00' },
  SM0X2: { color: '#be123c', price: 2.00, name: 'Staré Mesto – centrum X2', hours: 'Po–Ne 8:00–22:00' },
  SM1:   { color: '#dc2626', price: 1.50, name: 'Staré Mesto 1',          hours: 'Po–Pi 8:00–20:00, So 8:00–14:00' },
  SM2:   { color: '#dc2626', price: 1.00, name: 'Staré Mesto 2',          hours: 'Po–Pi 8:00–20:00, So 8:00–14:00' },
  NM1:   { color: '#ea580c', price: 1.00, name: 'Nové Mesto 1',           hours: 'Po–Pi 12:00–24:00, Ne 18:00–24:00' },
  NM2:   { color: '#ea580c', price: 1.00, name: 'Nové Mesto 2',           hours: 'Po–Pi 12:00–24:00, Ne 18:00–24:00' },
  NM4:   { color: '#f97316', price: 0.50, name: 'Nové Mesto 4',           hours: 'Po–Pi 8:00–18:00' },
  RU1:   { color: '#d97706', price: 1.00, name: 'Ružinov 1',              hours: 'Po–Pi 12:00–24:00, Ne 18:00–24:00' },
  RU2:   { color: '#ca8a04', price: 0.50, name: 'Ružinov 2',              hours: 'Po–Pi 8:00–18:00' },
  RU3:   { color: '#ca8a04', price: 0.50, name: 'Ružinov 3',              hours: 'Po–Pi 8:00–18:00' },
  PE1:   { color: '#16a34a', price: 1.00, name: 'Petržalka 1',            hours: 'Po–Pi 12:00–24:00, Ne 18:00–24:00' },
  RA1:   { color: '#0891b2', price: 0.50, name: 'Račá 1',                 hours: 'Po–Pi 8:00–18:00' },
  KV2:   { color: '#7c3aed', price: 0.50, name: 'Karlova Ves 2',          hours: 'Po–Pi 8:00–18:00' },
  LA1:   { color: '#6d28d9', price: 0.50, name: 'Lamač 1',                hours: 'Po–Pi 8:00–18:00' },
};

function getZoneMeta(code: string) {
  if (ZONE_META[code]) return ZONE_META[code];
  // Match by prefix (longest first)
  const match = Object.keys(ZONE_META)
    .sort((a, b) => b.length - a.length)
    .find(k => code.startsWith(k));
  if (match) return ZONE_META[match];
  return { color: '#64748b', price: 0.50, name: `Zóna ${code}`, hours: 'Po–Pi 8:00–18:00' };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const params = new URLSearchParams({
      where: "Status='active'",
      outFields: 'OBJECTID,Kod_parkovacej_zony,primar,Informacia_RPK_sk',
      returnGeometry: 'true',
      f: 'json',
    });

    const resp = await fetch(`${ARCGIS_URL}/query?${params}`, {
      signal: AbortSignal.timeout(15000),
      headers: { Accept: 'application/json' },
    });

    if (!resp.ok) throw new Error(`ArcGIS ${resp.status}`);
    const data = await resp.json();
    if (!data.features?.length) throw new Error('No features returned');

    const zones = (data.features as any[])
      .filter((f) => f.geometry?.rings?.length)
      .map((f) => {
        const code = f.attributes.primar ?? f.attributes.Kod_parkovacej_zony ?? 'UNKNOWN';
        const meta = getZoneMeta(code);
        // Convert all rings from Web Mercator to WGS84
        const rings: [number, number][][] = (f.geometry.rings as number[][][]).map((ring) =>
          ring.map(([x, y]) => merc2ll(x, y))
        );
        return {
          id: f.attributes.OBJECTID as number,
          code,
          fullCode: f.attributes.Kod_parkovacej_zony ?? code,
          color: meta.color,
          pricePerHour: meta.price,
          name: meta.name,
          hours: meta.hours,
          rings,
        };
      });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.json({ zones, count: zones.length });
  } catch (e) {
    console.error('paas-zones:', e);
    return res.status(500).json({ error: String(e) });
  }
}
