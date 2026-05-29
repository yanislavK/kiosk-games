import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  LANDMARKS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type Landmark,
  type LandmarkCategory,
} from '../data/bratislavaLandmarks';

interface Props {
  onBack: () => void;
}

const BRATISLAVA_CENTER: [number, number] = [48.1440, 17.1075];
const DEFAULT_ZOOM = 14;

// Group filter chips visually
const HERITAGE_CATS: LandmarkCategory[] = ['hrad', 'kostol', 'museum', 'park', 'most', 'namestie', 'divadlo', 'palac'];
const SERVICE_CATS: LandmarkCategory[] = ['policia', 'nemocnica', 'lekaren', 'doprava', 'urad', 'posta'];

function createMarkerIcon(color: string, selected: boolean): L.DivIcon {
  const size = selected ? 48 : 36;
  const border = selected ? '4px solid #fff' : '3px solid #fff';
  const shadow = selected
    ? `0 4px 16px rgba(0,0,0,0.5), 0 0 0 3px ${color}`
    : '0 3px 10px rgba(0,0,0,0.35)';
  return L.divIcon({
    className: 'custom-kiosk-marker',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:50%;
      border:${border};
      box-shadow:${shadow};
      transform:translate(-50%,-50%);
      cursor:pointer;
    "></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function MapScreen({ onBack }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [selected, setSelected] = useState<Landmark | null>(null);
  const [activeCategory, setActiveCategory] = useState<LandmarkCategory | 'all'>('all');

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    const map = L.map(mapElRef.current, {
      center: BRATISLAVA_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    LANDMARKS.forEach((lm) => {
      const marker = L.marker([lm.lat, lm.lng], {
        icon: createMarkerIcon(lm.color, false),
      }).addTo(map).on('click', () => setSelected(lm));
      markersRef.current.set(lm.id, marker);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    LANDMARKS.forEach((lm) => {
      const marker = markersRef.current.get(lm.id);
      if (!marker) return;
      const isSelected = selected?.id === lm.id;
      const isFiltered = activeCategory !== 'all' && lm.category !== activeCategory;
      marker.setIcon(createMarkerIcon(isFiltered ? '#cbd5e1' : lm.color, isSelected));
      marker.setOpacity(isFiltered ? 0.35 : 1);
    });
  }, [selected, activeCategory]);

  useEffect(() => {
    if (!selected || !mapRef.current) return;
    mapRef.current.flyTo([selected.lat, selected.lng], 16, { duration: 0.8 });
  }, [selected]);

  const filteredList = activeCategory === 'all'
    ? LANDMARKS
    : LANDMARKS.filter((l) => l.category === activeCategory);

  const handleClose = () => {
    setSelected(null);
    mapRef.current?.flyTo(BRATISLAVA_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>← Späť</button>
        <div style={styles.headerTitle}>
          <span style={{ fontSize: 40 }}>🗺️</span>
          <div>
            <div style={styles.titleText}>Mapa Bratislavy</div>
            <div style={styles.subtitleText}>Pamiatky · Múzeá · Služby mesta</div>
          </div>
        </div>
        <div style={styles.countBadge}>{LANDMARKS.length} miest</div>
      </div>

      {/* Category filter — two rows */}
      <div style={styles.filterWrap}>
        <div style={styles.filterRow}>
          <span style={styles.filterGroupLabel}>PAMIATKY</span>
          <button
            style={{ ...styles.chip, ...(activeCategory === 'all' ? styles.chipActive : {}) }}
            onClick={() => { setActiveCategory('all'); setSelected(null); }}
          >Všetky</button>
          {HERITAGE_CATS.map((cat) => (
            <button key={cat}
              style={{
                ...styles.chip,
                ...(activeCategory === cat
                  ? { background: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat], color: '#fff' }
                  : {}),
              }}
              onClick={() => { setActiveCategory(cat); setSelected(null); }}
            >
              {CATEGORY_LABELS[cat].split(' /')[0]}
            </button>
          ))}
        </div>
        <div style={styles.filterRow}>
          <span style={styles.filterGroupLabel}>SLUŽBY</span>
          {SERVICE_CATS.map((cat) => (
            <button key={cat}
              style={{
                ...styles.chip,
                ...(activeCategory === cat
                  ? { background: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat], color: '#fff' }
                  : {}),
              }}
              onClick={() => { setActiveCategory(cat); setSelected(null); }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div ref={mapElRef} style={styles.map} />

      {/* Bottom panel */}
      <div style={styles.bottomPanel}>
        {selected
          ? <DetailPanel landmark={selected} onClose={handleClose} />
          : <LandmarkList landmarks={filteredList} onSelect={setSelected} />}
      </div>
    </div>
  );
}

/* ── Detail Panel ─────────────────────────────────────────────── */
function DetailPanel({ landmark, onClose }: { landmark: Landmark; onClose: () => void }) {
  const [imgOk, setImgOk] = useState(true);

  // Reset img state when landmark changes
  useEffect(() => { setImgOk(true); }, [landmark.id]);

  const hasPhoto = landmark.photo && imgOk;

  return (
    <div style={detail.container}>
      {/* Photo column */}
      {hasPhoto && (
        <div style={detail.photoWrap}>
          <img
            src={landmark.photo}
            alt={landmark.name}
            style={detail.photo}
            onError={() => setImgOk(false)}
          />
        </div>
      )}

      {/* Info column */}
      <div style={{ ...detail.info, ...(hasPhoto ? {} : { width: '100%' }) }}>
        <div style={detail.topRow}>
          <div style={detail.topLeft}>
            <span style={{
              ...detail.badge,
              background: landmark.color + '20',
              color: landmark.color,
              borderColor: landmark.color + '50',
            }}>
              {landmark.icon} {CATEGORY_LABELS[landmark.category]}
            </span>
            <h2 style={detail.name}>{landmark.name}</h2>
          </div>
          <button style={detail.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={detail.meta}>
          <span>📍 {landmark.address}</span>
          {landmark.built && <span>🏗️ {landmark.built}</span>}
        </div>
        <p style={detail.desc}>{landmark.description}</p>
      </div>
    </div>
  );
}

/* ── Landmark List ────────────────────────────────────────────── */
function LandmarkList({ landmarks, onSelect }: { landmarks: Landmark[]; onSelect: (l: Landmark) => void }) {
  return (
    <div style={list.container}>
      <div style={list.label}>
        Kliknite na marker na mape alebo vyberte miesto zo zoznamu
      </div>
      <div style={list.scroll}>
        {landmarks.map((lm) => (
          <button key={lm.id} style={list.card} onClick={() => onSelect(lm)}>
            <div style={{ ...list.dot, background: lm.color }}>{lm.icon}</div>
            <div style={list.cardText}>
              <div style={list.cardName}>{lm.name}</div>
              <div style={list.cardCat}>{CATEGORY_LABELS[lm.category]}</div>
            </div>
            {lm.photo && <span style={list.photoFlag}>📷</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Styles ───────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', background: '#f0f6ff' },
  header: {
    display: 'flex', alignItems: 'center', gap: '20px', padding: '18px 32px',
    background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', flexShrink: 0,
  },
  backBtn: {
    background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)',
    color: '#fff', borderRadius: '12px', padding: '10px 20px',
    fontSize: '20px', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
  },
  headerTitle: { flex: 1, display: 'flex', alignItems: 'center', gap: '16px' },
  titleText: { fontSize: '32px', fontWeight: 900, color: '#fff', lineHeight: 1.1 },
  subtitleText: { fontSize: '16px', color: 'rgba(255,255,255,0.75)', fontWeight: 500 },
  countBadge: {
    background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)',
    color: '#fff', borderRadius: '20px', padding: '8px 18px', fontSize: '17px', fontWeight: 700, flexShrink: 0,
  },
  filterWrap: {
    display: 'flex', flexDirection: 'column', gap: '6px',
    padding: '10px 20px', background: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0,
  },
  filterRow: {
    display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto',
    paddingBottom: '2px',
  },
  filterGroupLabel: {
    fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em',
    flexShrink: 0, paddingRight: '4px',
  },
  chip: {
    flexShrink: 0, padding: '8px 16px', borderRadius: '20px',
    border: '2px solid #e2e8f0', background: '#f8fafc',
    color: '#475569', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
  },
  chipActive: { background: '#2563eb', borderColor: '#2563eb', color: '#fff' },
  map: { flex: 1, minHeight: 0 },
  bottomPanel: {
    height: '540px', flexShrink: 0, background: '#fff',
    borderTop: '3px solid #e2e8f0', overflow: 'hidden',
  },
};

const detail: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex', height: '100%', overflow: 'hidden',
  },
  photoWrap: {
    width: '400px', flexShrink: 0, overflow: 'hidden',
  },
  photo: {
    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
  },
  info: {
    flex: 1, padding: '24px 28px 16px', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  topRow: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
  },
  topLeft: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '5px 14px', borderRadius: '18px', border: '1.5px solid',
    fontSize: '15px', fontWeight: 700, alignSelf: 'flex-start',
  },
  name: { fontSize: '30px', fontWeight: 900, color: '#1e293b', lineHeight: 1.15, margin: 0 },
  closeBtn: {
    width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9',
    border: '2px solid #e2e8f0', fontSize: '20px', color: '#64748b', cursor: 'pointer', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  meta: {
    display: 'flex', flexDirection: 'column', gap: '4px',
    fontSize: '17px', color: '#64748b', fontWeight: 500,
  },
  desc: {
    fontSize: '19px', color: '#334155', lineHeight: 1.65, margin: 0, flex: 1,
  },
};

const list: Record<string, React.CSSProperties> = {
  container: { height: '100%', display: 'flex', flexDirection: 'column' },
  label: {
    fontSize: '16px', color: '#94a3b8', fontWeight: 600,
    padding: '12px 28px 10px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
  },
  scroll: {
    flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 20px',
  },
  card: {
    display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px',
    background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px',
    cursor: 'pointer', textAlign: 'left', flexShrink: 0,
  },
  dot: {
    width: '44px', height: '44px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '20px',
    flexShrink: 0, border: '3px solid rgba(255,255,255,0.5)',
  },
  cardText: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 },
  cardName: { fontSize: '21px', fontWeight: 700, color: '#1e293b' },
  cardCat: { fontSize: '16px', color: '#64748b', fontWeight: 500 },
  photoFlag: { fontSize: '18px', opacity: 0.6, flexShrink: 0 },
};
