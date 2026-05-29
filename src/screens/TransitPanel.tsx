import React, { useEffect, useState, useRef } from 'react';
import type { Landmark } from '../data/bratislavaLandmarks';

/* ── Constants ───────────────────────────────────────────────── */
const KIOSK = { lat: 48.1340637, lng: 17.1927696 };

// Pre-loaded stops near kiosk (from Overpass data)
const KIOSK_STOPS: Stop[] = [
  {
    id: 'oc-slovnaftska',
    name: 'OC Slovnaftská',
    lat: 48.13068, lng: 17.19220,
    lines: [
      { ref: '70',  color: '#e53e3e', dest: 'Most SNP / Stn. P. Biskupice' },
      { ref: '87',  color: '#805ad5', dest: 'Ovsište / Bodvianska' },
      { ref: '725', color: '#2b6cb0', dest: 'Miloslavov' },
      { ref: '720', color: '#2b6cb0', dest: 'Tomášov / Vlky' },
      { ref: '727', color: '#2b6cb0', dest: 'Šamorín' },
      { ref: '737', color: '#2b6cb0', dest: 'Hamuliakovo / Šamorín' },
      { ref: '740', color: '#2b6cb0', dest: 'Tomášov / Čenkovce' },
    ],
  },
  {
    id: 'priekopnicka',
    name: 'Priekopnícka',
    lat: 48.13694, lng: 17.19622,
    lines: [
      { ref: '65', color: '#38a169', dest: 'Tbiliská / Stn. Vrakuňa' },
      { ref: '70', color: '#e53e3e', dest: 'Most SNP / Stn. P. Biskupice' },
      { ref: '75', color: '#dd6b20', dest: 'Kadnárova / Stn. Vrakuňa' },
      { ref: '87', color: '#805ad5', dest: 'Ovsište / Bodvianska' },
    ],
  },
  {
    id: 'slovnaftska',
    name: 'Slovnaftská',
    lat: 48.13096, lng: 17.19583,
    lines: [
      { ref: '65', color: '#38a169', dest: 'Tbiliská / Stn. Vrakuňa' },
      { ref: '70', color: '#e53e3e', dest: 'Most SNP / Stn. P. Biskupice' },
      { ref: '75', color: '#dd6b20', dest: 'Kadnárova / Stn. Vrakuňa' },
      { ref: '87', color: '#805ad5', dest: 'Ovsište / Bodvianska' },
    ],
  },
];

/* ── Types ───────────────────────────────────────────────────── */
interface Line { ref: string; color: string; dest: string }
interface Stop { id: string; name: string; lat: number; lng: number; lines: Line[] }
interface Departure { line: string; dest: string; time: string; mins: number }

/* ── Helpers ─────────────────────────────────────────────────── */
function haversineM(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function walkMin(m: number) { return Math.ceil(m / 70); } // ~70 m/min walking

/** Fetch departures via our Vercel proxy (avoids imhd.sk CORS block) */
async function fetchDepartures(stopName: string): Promise<Departure[]> {
  try {
    // Step 1: search for stop ID
    const searchRes = await fetch(
      `/api/imhd?endpoint=zastavky&q=${encodeURIComponent(stopName)}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    const stops = Array.isArray(searchData) ? searchData : searchData?.zastavky ?? [];
    const stop = stops[0];
    if (!stop?.id) return [];

    // Step 2: fetch departures for that stop
    const depRes = await fetch(
      `/api/imhd?endpoint=odchody&zastavka=${stop.id}&typ=D`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!depRes.ok) return [];
    const depData = await depRes.json();
    const items: Record<string, unknown>[] = depData?.odchody ?? depData ?? [];
    const now = new Date();

    return items.slice(0, 10).map((d) => {
      const timeStr = String(d.cas ?? d.time ?? '');
      const [h, m] = timeStr.split(':').map(Number);
      const dep = new Date(now);
      dep.setHours(h ?? 0, m ?? 0, 0, 0);
      if (dep < now) dep.setDate(dep.getDate() + 1); // next day wrap
      const mins = Math.round((dep.getTime() - now.getTime()) / 60000);
      return {
        line: String(d.linka ?? d.line ?? '?'),
        dest: String(d.ciel ?? d.cielova_zastavka ?? d.destination ?? ''),
        time: timeStr,
        mins,
      } as Departure;
    }).filter((d) => d.mins >= 0 && d.mins < 120);
  } catch {
    return [];
  }
}

/** Fetch stops near a lat/lng via our Overpass proxy (POST avoids WAF 406) */
async function fetchNearbyStops(lat: number, lng: number): Promise<Stop[]> {
  try {
    const q = `[out:json][timeout:15];
(node[highway=bus_stop](around:400,${lat},${lng});
 node[public_transport=stop_position](around:400,${lat},${lng}););
out body;`;
    const res = await fetch('/api/overpass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    const seen = new Set<string>();
    const stops: Stop[] = [];
    for (const n of (data.elements ?? [])) {
      const name = n.tags?.name;
      if (!name || seen.has(name)) continue;
      seen.add(name);
      stops.push({ id: String(n.id), name, lat: n.lat, lng: n.lon, lines: [] });
    }
    return stops
      .sort((a, b) => haversineM(lat, lng, a.lat, a.lng) - haversineM(lat, lng, b.lat, b.lng))
      .slice(0, 4);
  } catch {
    return [];
  }
}

/* ── Main component ──────────────────────────────────────────── */
interface Props { destination: Landmark | null }

export default function TransitPanel({ destination }: Props) {
  const [activeStop, setActiveStop]     = useState<Stop | null>(null);
  const [departures, setDepartures]     = useState<Departure[]>([]);
  const [depsLoading, setDepsLoading]   = useState(false);
  const [depsError, setDepsError]       = useState(false);

  const [destStops, setDestStops]       = useState<Stop[]>([]);
  const [destLoading, setDestLoading]   = useState(false);

  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [now, setNow] = useState(() => new Date());

  // Live clock for "X min" counter
  useEffect(() => {
    clockRef.current = setInterval(() => setNow(new Date()), 30000);
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, []);

  // Fetch stops near destination
  useEffect(() => {
    setDestStops([]);
    if (!destination) return;
    setDestLoading(true);
    fetchNearbyStops(destination.lat, destination.lng)
      .then(setDestStops)
      .finally(() => setDestLoading(false));
  }, [destination?.id]);

  // Fetch departures when stop selected
  useEffect(() => {
    setDepartures([]);
    setDepsError(false);
    if (!activeStop) return;
    setDepsLoading(true);
    fetchDepartures(activeStop.name)
      .then((deps) => {
        setDepartures(deps);
        setDepsError(deps.length === 0);
      })
      .finally(() => setDepsLoading(false));
  }, [activeStop?.id]);

  const fromStops = KIOSK_STOPS.map((s) => ({
    ...s,
    distM: haversineM(KIOSK.lat, KIOSK.lng, s.lat, s.lng),
  })).sort((a, b) => a.distM - b.distM);

  return (
    <div style={s.root}>
      {/* ── FROM: stops near kiosk ─── */}
      <div style={s.col}>
        <div style={s.colHeader}>
          <span style={s.colIcon}>📍</span>
          <div>
            <div style={s.colTitle}>Nástupné zastávky</div>
            <div style={s.colSub}>Svornosti 42 → MHD</div>
          </div>
        </div>

        <div style={s.stopList}>
          {fromStops.map((stop) => {
            const active = activeStop?.id === stop.id;
            return (
              <div key={stop.id}>
                <button
                  style={{ ...s.stopCard, ...(active ? s.stopCardActive : {}) }}
                  onClick={() => setActiveStop(active ? null : stop)}
                >
                  <div style={s.stopLeft}>
                    <div style={s.stopName}>{stop.name}</div>
                    <div style={s.stopMeta}>
                      🚶 {stop.distM} m · {walkMin(stop.distM)} min pešo
                    </div>
                    <div style={s.lineRow}>
                      {stop.lines.map((l) => (
                        <span key={l.ref} style={{ ...s.lineBadge, background: l.color }}>
                          {l.ref}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span style={s.chevron}>{active ? '▲' : '▼'}</span>
                </button>

                {active && (
                  <div style={s.depPanel}>
                    {depsLoading && <div style={s.depMsg}>⏳ Načítavam odchody...</div>}
                    {!depsLoading && depsError && (
                      <div style={s.depMsg}>
                        Odchody nedostupné online.
                        <br />
                        <a
                          href={`https://imhd.sk/ba/cestovny-poriadok/zastavka/${encodeURIComponent(stop.name)}`}
                          target="_blank" rel="noreferrer"
                          style={s.imhdLink}
                        >
                          Zobraziť na imhd.sk ↗
                        </a>
                      </div>
                    )}
                    {!depsLoading && departures.length > 0 && (
                      <div style={s.depGrid}>
                        {departures.map((d, i) => {
                          const mins = Math.round((
                            (() => {
                              const [h, m] = d.time.split(':').map(Number);
                              const t = new Date(now);
                              t.setHours(h, m, 0, 0);
                              return (t.getTime() - now.getTime()) / 60000;
                            })()
                          ));
                          const lineColor = stop.lines.find((l) => l.ref === d.line)?.color ?? '#64748b';
                          return (
                            <div key={i} style={s.depRow}>
                              <span style={{ ...s.lineBadge, background: lineColor, fontSize: 15 }}>
                                {d.line}
                              </span>
                              <span style={s.depDest}>{d.dest}</span>
                              <span style={{ ...s.depTime, color: mins <= 2 ? '#dc2626' : mins <= 5 ? '#ea580c' : '#16a34a' }}>
                                {mins <= 0 ? 'teraz' : `${mins} min`}
                              </span>
                              <span style={s.depClock}>{d.time}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* divider */}
      <div style={s.divider} />

      {/* ── TO: stops near destination ─── */}
      <div style={s.col}>
        <div style={s.colHeader}>
          <span style={s.colIcon}>🏁</span>
          <div>
            <div style={s.colTitle}>Cieľové zastávky</div>
            <div style={s.colSub}>
              {destination ? destination.name : 'Vyberte cieľ na mape'}
            </div>
          </div>
        </div>

        {!destination && (
          <div style={s.placeholder}>
            Kliknite na pamätné miesto na mape, potom tu uvidíte najbližšie zastávky k cieľu.
          </div>
        )}

        {destination && destLoading && (
          <div style={s.placeholder}>⏳ Hľadám zastávky...</div>
        )}

        {destination && !destLoading && destStops.length === 0 && (
          <div style={s.placeholder}>Žiadne zastávky do 400 m od cieľa.</div>
        )}

        {destination && !destLoading && destStops.length > 0 && (
          <div style={s.stopList}>
            {destStops.map((stop) => {
              const distM = haversineM(destination.lat, destination.lng, stop.lat, stop.lng);
              return (
                <div key={stop.id} style={{ ...s.stopCard, cursor: 'default' }}>
                  <div style={s.stopLeft}>
                    <div style={s.stopName}>{stop.name}</div>
                    <div style={s.stopMeta}>
                      🚶 {distM} m · {walkMin(distM)} min od cieľa
                    </div>
                    {stop.lines.length > 0 && (
                      <div style={s.lineRow}>
                        {stop.lines.map((l) => (
                          <span key={l.ref} style={{ ...s.lineBadge, background: l.color }}>
                            {l.ref}
                          </span>
                        ))}
                      </div>
                    )}
                    <a
                      href={`https://imhd.sk/ba/cestovny-poriadok/zastavka/${encodeURIComponent(stop.name)}`}
                      target="_blank" rel="noreferrer"
                      style={s.imhdLink}
                    >
                      Zobraziť zastávku na imhd.sk ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full trip planner link on imhd.sk */}
        {destination && (
          <a
            href={`https://imhd.sk/ba/spojenie/z/${encodeURIComponent('Svornosti 42, Bratislava')}/do/${encodeURIComponent(destination.name)}`}
            target="_blank" rel="noreferrer"
            style={s.planBtn}
          >
            🗓️ Celé spojenie na imhd.sk ↗
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
  },
  col: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: '14px 16px',
    gap: '10px',
  },
  colHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  colIcon: { fontSize: 28 },
  colTitle: { fontSize: 17, fontWeight: 800, color: '#1e293b' },
  colSub: { fontSize: 13, color: '#64748b', fontWeight: 500 },
  divider: {
    width: '2px',
    background: '#e2e8f0',
    flexShrink: 0,
    margin: '12px 0',
  },
  stopList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  stopCard: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8px',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    padding: '10px 14px',
    textAlign: 'left',
    cursor: 'pointer',
    width: '100%',
  },
  stopCardActive: {
    border: '2px solid #2563eb',
    background: '#eff6ff',
  },
  stopLeft: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  stopName: { fontSize: 17, fontWeight: 700, color: '#1e293b' },
  stopMeta: { fontSize: 13, color: '#64748b' },
  lineRow: { display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: 2 },
  lineBadge: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: '6px',
    letterSpacing: '0.04em',
  },
  chevron: { fontSize: 13, color: '#94a3b8', flexShrink: 0, paddingTop: 4 },
  depPanel: {
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '0 0 12px 12px',
    marginTop: -6,
    padding: '10px 14px',
  },
  depMsg: { fontSize: 14, color: '#64748b', lineHeight: 1.6 },
  depGrid: { display: 'flex', flexDirection: 'column', gap: '5px' },
  depRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  depDest: { flex: 1, fontSize: 14, color: '#334155', fontWeight: 500, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  depTime: { fontSize: 16, fontWeight: 800, flexShrink: 0 },
  depClock: { fontSize: 13, color: '#94a3b8', flexShrink: 0 },
  imhdLink: {
    fontSize: 13,
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
    marginTop: 4,
    display: 'inline-block',
  },
  placeholder: {
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 1.6,
    padding: '12px 4px',
  },
  planBtn: {
    display: 'block',
    textAlign: 'center',
    padding: '10px 14px',
    background: '#7c3aed',
    color: '#fff',
    borderRadius: '12px',
    fontSize: 15,
    fontWeight: 700,
    textDecoration: 'none',
    flexShrink: 0,
    marginTop: 4,
  },
};
