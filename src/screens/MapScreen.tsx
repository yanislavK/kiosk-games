import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  LANDMARKS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type Landmark,
  type LandmarkCategory,
} from '../data/bratislavaLandmarks';
import TransitPanel from './TransitPanel';

interface Props {
  onBack: () => void;
}

// ── Kiosk location ────────────────────────────────────────────
const KIOSK = { lat: 48.1340637, lng: 17.1927696, name: 'Ulica Svornosti 42, Bratislava' };

// ── Map defaults ─────────────────────────────────────────────
// Centre between kiosk (17.19) and old town (17.11) at zoom 13
const MAP_CENTER: [number, number] = [48.1370, 17.1500];
const DEFAULT_ZOOM = 13;

// ── Routing ───────────────────────────────────────────────────
type RouteMode = 'walk' | 'bike' | 'car' | 'transit';

interface RouteInfo {
  distance: number;   // metres
  duration: number;   // seconds
  mode: RouteMode;
}

const OSRM_PROFILE: Record<string, string> = {
  walk: 'foot',
  bike: 'bike',
  car:  'driving',
};

const MODE_META: Record<RouteMode, { label: string; icon: string; color: string }> = {
  walk:    { label: 'Pešo',      icon: '🚶', color: '#16a34a' },
  bike:    { label: 'Bicykel',   icon: '🚴', color: '#0369a1' },
  car:     { label: 'Auto',      icon: '🚗', color: '#92400e' },
  transit: { label: 'MHD',       icon: '🚌', color: '#7c3aed' },
};

function fmtDist(m: number) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}
function fmtTime(s: number) {
  const min = Math.round(s / 60);
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}

// ── Marker icons ──────────────────────────────────────────────
function landmarkIcon(color: string, selected: boolean): L.DivIcon {
  const size = selected ? 46 : 34;
  const shadow = selected
    ? `0 4px 16px rgba(0,0,0,0.5), 0 0 0 3px ${color}`
    : '0 3px 10px rgba(0,0,0,0.35)';
  return L.divIcon({
    className: 'custom-kiosk-marker',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:${selected ? '4px' : '3px'} solid #fff;box-shadow:${shadow};transform:translate(-50%,-50%);cursor:pointer;"></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

const kioskIcon = L.divIcon({
  className: 'custom-kiosk-marker',
  html: `<div style="transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;cursor:default;">
    <div style="background:#dc2626;color:#fff;padding:6px 12px;border-radius:20px;font-size:15px;font-weight:800;white-space:nowrap;box-shadow:0 4px 16px rgba(220,38,38,0.5);border:2px solid #fff;">📍 Ste tu</div>
    <div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:10px solid #dc2626;margin-top:-1px;"></div>
  </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

// ── Category groups ───────────────────────────────────────────
const HERITAGE_CATS: LandmarkCategory[] = ['hrad','kostol','museum','park','most','namestie','divadlo','palac'];
const SERVICE_CATS:  LandmarkCategory[] = ['policia','nemocnica','lekaren','doprava','urad','posta'];

export default function MapScreen({ onBack }: Props) {
  const mapRef        = useRef<L.Map | null>(null);
  const mapElRef      = useRef<HTMLDivElement>(null);
  const markersRef    = useRef<Map<string, L.Marker>>(new Map());
  const routeLayerRef = useRef<L.Polyline | null>(null);

  const [selected,       setSelected]       = useState<Landmark | null>(null);
  const [activeCategory, setActiveCategory] = useState<LandmarkCategory | 'all'>('all');
  const [routeInfo,      setRouteInfo]      = useState<RouteInfo | null>(null);
  const [routeMode,      setRouteMode]      = useState<RouteMode | null>(null);
  const [calculating,    setCalculating]    = useState(false);

  // ── Init map ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    const map = L.map(mapElRef.current, { center: MAP_CENTER, zoom: DEFAULT_ZOOM, zoomControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Kiosk "Ste tu" marker
    L.marker([KIOSK.lat, KIOSK.lng], { icon: kioskIcon, zIndexOffset: 1000 }).addTo(map);

    // Landmark markers
    LANDMARKS.forEach((lm) => {
      const marker = L.marker([lm.lat, lm.lng], { icon: landmarkIcon(lm.color, false) })
        .addTo(map)
        .on('click', () => setSelected(lm));
      markersRef.current.set(lm.id, marker);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── Update marker styles ───────────────────────────────────
  useEffect(() => {
    LANDMARKS.forEach((lm) => {
      const marker = markersRef.current.get(lm.id);
      if (!marker) return;
      const isFiltered = activeCategory !== 'all' && lm.category !== activeCategory;
      marker.setIcon(landmarkIcon(isFiltered ? '#cbd5e1' : lm.color, selected?.id === lm.id));
      marker.setOpacity(isFiltered ? 0.35 : 1);
    });
  }, [selected, activeCategory]);

  // ── Calculate route via OSRM ───────────────────────────────
  const calcRoute = useCallback(async (mode: RouteMode, dest: Landmark) => {
    if (mode === 'transit') {
      setRouteMode('transit');
      setRouteInfo({ distance: 0, duration: 0, mode: 'transit' });
      if (routeLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      return;
    }

    setCalculating(true);
    setRouteMode(mode);
    setRouteInfo(null);

    const profile = OSRM_PROFILE[mode];
    const coord   = `${KIOSK.lng},${KIOSK.lat};${dest.lng},${dest.lat}`;
    const qs      = 'overview=full&geometries=geojson';

    // Try primary OSRM server, then fallback
    const urls = [
      `https://router.project-osrm.org/route/v1/${profile}/${coord}?${qs}`,
      `https://routing.openstreetmap.de/routed-${profile === 'driving' ? 'car' : profile}/route/v1/${profile}/${coord}?${qs}`,
    ];

    let lastError: unknown;
    for (const url of urls) {
      try {
        const res  = await fetch(url, { signal: AbortSignal.timeout(10000) });
        const data = await res.json();
        if (data.code !== 'Ok' || !data.routes?.length) continue;

        const route = data.routes[0];
        const coords: [number, number][] = route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );

        if (routeLayerRef.current && mapRef.current) mapRef.current.removeLayer(routeLayerRef.current);
        const color = MODE_META[mode].color;
        routeLayerRef.current = L.polyline(coords, { color, weight: 6, opacity: 0.85 })
          .addTo(mapRef.current!);

        mapRef.current!.fitBounds(
          L.latLngBounds([[KIOSK.lat, KIOSK.lng], [dest.lat, dest.lng]]),
          { padding: [80, 80], maxZoom: 16 }
        );

        setRouteInfo({ distance: route.distance, duration: route.duration, mode });
        setCalculating(false);
        return; // success
      } catch (e) {
        lastError = e;
      }
    }

    // Both servers failed
    console.warn('Route calculation failed:', lastError);
    setRouteInfo({ distance: -1, duration: -1, mode }); // sentinel for error state
    setCalculating(false);
  }, []);

  // ── routeMode ref: always reflects latest value in effects ──
  const routeModeRef = useRef<RouteMode | null>(null);
  useEffect(() => { routeModeRef.current = routeMode; }, [routeMode]);

  // ── Landmark change: recalculate route OR fly to it ────────
  useEffect(() => {
    if (!selected || !mapRef.current) return;
    const mode = routeModeRef.current;
    if (mode && mode !== 'transit') {
      calcRoute(mode, selected);       // keep same transport mode, new destination
    } else if (!mode) {
      mapRef.current.flyTo([selected.lat, selected.lng], 15, { duration: 0.7 });
    }
    // transit mode: TransitPanel fetches its own data
  }, [selected, calcRoute]);

  // ── Clear route ────────────────────────────────────────────
  const clearRoute = useCallback(() => {
    if (routeLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    setRouteInfo(null);
    setRouteMode(null);
  }, []);

  // ── Close landmark ─────────────────────────────────────────
  const handleClose = () => {
    clearRoute();
    setSelected(null);
    mapRef.current?.flyTo(MAP_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
  };

  const filteredList = activeCategory === 'all'
    ? LANDMARKS
    : LANDMARKS.filter((l) => l.category === activeCategory);

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Späť</button>
        <div style={s.headerTitle}>
          <span style={{ fontSize: 38 }}>🗺️</span>
          <div>
            <div style={s.titleText}>Mapa Bratislavy</div>
            <div style={s.subtitleText}>📍 Ste tu: Svornosti 42, Komárov</div>
          </div>
        </div>
        <div style={s.countBadge}>{LANDMARKS.length} miest</div>
      </div>

      {/* Category filter */}
      <div style={s.filterWrap}>
        <div style={s.filterRow}>
          <span style={s.groupLabel}>PAMIATKY</span>
          <button style={{ ...s.chip, ...(activeCategory === 'all' ? s.chipActive : {}) }}
            onClick={() => { setActiveCategory('all'); setSelected(null); clearRoute(); }}>Všetky</button>
          {HERITAGE_CATS.map((cat) => (
            <button key={cat}
              style={{ ...s.chip, ...(activeCategory === cat ? { background: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat], color: '#fff' } : {}) }}
              onClick={() => { setActiveCategory(cat); setSelected(null); clearRoute(); }}>
              {CATEGORY_LABELS[cat].split(' /')[0]}
            </button>
          ))}
        </div>
        <div style={s.filterRow}>
          <span style={s.groupLabel}>SLUŽBY</span>
          {SERVICE_CATS.map((cat) => (
            <button key={cat}
              style={{ ...s.chip, ...(activeCategory === cat ? { background: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat], color: '#fff' } : {}) }}
              onClick={() => { setActiveCategory(cat); setSelected(null); clearRoute(); }}>
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div ref={mapElRef} style={s.map} />

      {/* Bottom panel */}
      <div style={{ ...s.bottomPanel, ...(routeMode === 'transit' ? { height: '580px' } : {}) }}>
        {routeMode === 'transit' && selected ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '2px solid #e2e8f0', flexShrink: 0, background: '#f8fafc' }}>
              <button
                onClick={() => { clearRoute(); }}
                style={{ padding: '7px 16px', borderRadius: 10, border: '2px solid #e2e8f0', background: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                ← Späť
              </button>
              <span style={{ fontSize: 17, fontWeight: 800, color: '#1e293b' }}>
                🚌 MHD: Svornosti 42 → {selected.name}
              </span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <TransitPanel destination={selected} />
            </div>
          </div>
        ) : selected ? (
          <DetailPanel
            landmark={selected}
            routeMode={routeMode}
            routeInfo={routeInfo}
            calculating={calculating}
            onClose={handleClose}
            onRoute={calcRoute}
            onClearRoute={clearRoute}
          />
        ) : (
          <LandmarkList landmarks={filteredList} onSelect={setSelected} />
        )}
      </div>
    </div>
  );
}

/* ── Detail Panel ──────────────────────────────────────────── */
function DetailPanel({
  landmark, routeMode, routeInfo, calculating, onClose, onRoute, onClearRoute,
}: {
  landmark: Landmark;
  routeMode: RouteMode | null;
  routeInfo: RouteInfo | null;
  calculating: boolean;
  onClose: () => void;
  onRoute: (mode: RouteMode, dest: Landmark) => void;
  onClearRoute: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => { setImgFailed(false); }, [landmark.id]);


  return (
    <div style={dp.container}>
      {/* Photo column */}
      {landmark.photo && (
        <div style={{ ...dp.photoWrap, background: landmark.color + '18' }}>
          {imgFailed
            ? <div style={dp.placeholder}><span style={{ fontSize: 64 }}>{landmark.icon}</span></div>
            : <img src={landmark.photo} alt={landmark.name} style={dp.photo} onError={() => setImgFailed(true)} />}
        </div>
      )}

      {/* Info + route column */}
      <div style={{ ...dp.info, ...(!landmark.photo ? { width: '100%' } : {}) }}>
        {/* Top: name + close */}
        <div style={dp.topRow}>
          <div style={dp.topLeft}>
            <span style={{ ...dp.badge, background: landmark.color + '20', color: landmark.color, borderColor: landmark.color + '50' }}>
              {landmark.icon} {CATEGORY_LABELS[landmark.category]}
            </span>
            <h2 style={dp.name}>{landmark.name}</h2>
          </div>
          <button style={dp.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Meta */}
        <div style={dp.meta}>
          <span>📍 {landmark.address}</span>
          {landmark.built && <span>🏗️ {landmark.built}</span>}
        </div>

        {/* Description (truncated if routing shown) */}
        {!routeMode && <p style={dp.desc}>{landmark.description}</p>}

        {/* ── Route section ─────────────────── */}
        <div style={dp.routeSection}>
          <div style={dp.routeLabel}>🧭 Plán trasy z Svornosti 42:</div>

          {/* Mode buttons */}
          <div style={dp.modeBtns}>
            {(Object.keys(MODE_META) as RouteMode[]).map((mode) => {
              const meta = MODE_META[mode];
              const active = routeMode === mode;
              return (
                <button key={mode}
                  style={{ ...dp.modeBtn, ...(active ? { background: meta.color, color: '#fff', borderColor: meta.color } : {}) }}
                  onClick={() => onRoute(mode, landmark)}
                  disabled={calculating}
                >
                  {meta.icon} {meta.label}
                </button>
              );
            })}
            {routeMode && (
              <button style={dp.clearBtn} onClick={onClearRoute}>✕</button>
            )}
          </div>

          {/* Route info */}
          {calculating && <div style={dp.routeInfo}>⏳ Vypočítava sa trasa...</div>}

          {routeInfo && !calculating && routeInfo.distance >= 0 && (
            <div style={dp.routeResult}>
              <span style={{ ...dp.routeBadge, background: MODE_META[routeInfo.mode].color }}>
                {MODE_META[routeInfo.mode].icon} {fmtTime(routeInfo.duration)}
              </span>
              <span style={dp.routeDist}>📏 {fmtDist(routeInfo.distance)}</span>
            </div>
          )}
          {routeInfo && !calculating && routeInfo.distance < 0 && (
            <div style={{ fontSize: 14, color: '#dc2626', fontStyle: 'italic' }}>
              ⚠️ Trasu sa nepodarilo vypočítať. Skúste znova.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Landmark List ─────────────────────────────────────────── */
function LandmarkList({ landmarks, onSelect }: { landmarks: Landmark[]; onSelect: (l: Landmark) => void }) {
  return (
    <div style={ll.container}>
      <div style={ll.label}>Kliknite na marker na mape alebo vyberte miesto zo zoznamu</div>
      <div style={ll.scroll}>
        {landmarks.map((lm) => (
          <button key={lm.id} style={ll.card} onClick={() => onSelect(lm)}>
            <div style={{ ...ll.dot, background: lm.color }}>{lm.icon}</div>
            <div style={ll.cardText}>
              <div style={ll.cardName}>{lm.name}</div>
              <div style={ll.cardCat}>{CATEGORY_LABELS[lm.category]}</div>
            </div>
            {lm.photo && <span style={{ fontSize: 16, opacity: 0.5 }}>📷</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Styles ────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', background: '#f0f6ff' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 28px', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', flexShrink: 0 },
  backBtn: { background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '12px', padding: '10px 18px', fontSize: '19px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 },
  headerTitle: { flex: 1, display: 'flex', alignItems: 'center', gap: '14px' },
  titleText: { fontSize: '28px', fontWeight: 900, color: '#fff', lineHeight: 1.1 },
  subtitleText: { fontSize: '15px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 },
  countBadge: { background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '20px', padding: '7px 16px', fontSize: '16px', fontWeight: 700, flexShrink: 0 },
  filterWrap: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 16px', background: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 },
  filterRow: { display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' },
  groupLabel: { fontSize: '10px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', flexShrink: 0 },
  chip: { flexShrink: 0, padding: '7px 14px', borderRadius: '18px', border: '2px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: '15px', fontWeight: 600, cursor: 'pointer' },
  chipActive: { background: '#2563eb', borderColor: '#2563eb', color: '#fff' },
  map: { flex: 1, minHeight: 0 },
  bottomPanel: { height: '520px', flexShrink: 0, background: '#fff', borderTop: '3px solid #e2e8f0', overflow: 'hidden' },
};

const dp: Record<string, React.CSSProperties> = {
  container: { display: 'flex', height: '100%', overflow: 'hidden' },
  photoWrap: { width: '340px', height: '100%', flexShrink: 0, overflow: 'hidden' },
  photo: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  placeholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, padding: '18px 22px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  topRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' },
  topLeft: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '16px', border: '1.5px solid', fontSize: '14px', fontWeight: 700, alignSelf: 'flex-start' },
  name: { fontSize: '26px', fontWeight: 900, color: '#1e293b', lineHeight: 1.15, margin: 0 },
  closeBtn: { width: '44px', height: '44px', borderRadius: '50%', background: '#f1f5f9', border: '2px solid #e2e8f0', fontSize: '18px', color: '#64748b', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  meta: { display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '15px', color: '#64748b', fontWeight: 500 },
  desc: { fontSize: '17px', color: '#334155', lineHeight: 1.6, margin: 0, flex: 1 },
  routeSection: { borderTop: '2px solid #f1f5f9', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 },
  routeLabel: { fontSize: '15px', fontWeight: 700, color: '#475569' },
  modeBtns: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  modeBtn: { padding: '9px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' },
  clearBtn: { width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #e2e8f0', background: '#fee2e2', color: '#dc2626', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  routeInfo: { fontSize: '16px', color: '#64748b', fontStyle: 'italic' },
  routeResult: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  routeBadge: { color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '17px', fontWeight: 800 },
  routeDist: { fontSize: '16px', color: '#475569', fontWeight: 600 },
  gmapsBtn: { padding: '9px 18px', borderRadius: '12px', background: '#1d4ed8', color: '#fff', border: 'none', fontSize: '15px', fontWeight: 700, cursor: 'pointer' },
  transitPanel: { display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', borderRadius: '12px', padding: '12px 14px', border: '1.5px solid #e2e8f0' },
  transitTitle: { fontSize: '16px', fontWeight: 800, color: '#1e293b' },
  transitText: { fontSize: '14px', color: '#64748b', lineHeight: 1.5 },
  transitBtns: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
};

const ll: Record<string, React.CSSProperties> = {
  container: { height: '100%', display: 'flex', flexDirection: 'column' },
  label: { fontSize: '15px', color: '#94a3b8', fontWeight: 600, padding: '10px 24px 8px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 },
  scroll: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px 18px' },
  card: { display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', cursor: 'pointer', textAlign: 'left', flexShrink: 0 },
  dot: { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, border: '3px solid rgba(255,255,255,0.5)' },
  cardText: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 },
  cardName: { fontSize: '19px', fontWeight: 700, color: '#1e293b' },
  cardCat: { fontSize: '14px', color: '#64748b', fontWeight: 500 },
};
