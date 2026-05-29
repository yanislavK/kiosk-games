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

function createMarkerIcon(color: string, selected: boolean): L.DivIcon {
  const size = selected ? 48 : 38;
  const border = selected ? '4px solid #fff' : '3px solid #fff';
  const shadow = selected
    ? '0 4px 16px rgba(0,0,0,0.5), 0 0 0 3px ' + color
    : '0 3px 10px rgba(0,0,0,0.35)';
  // iconSize [0,0] + iconAnchor [0,0] → Leaflet places the element at the coordinate
  // without any margin offset; we use CSS translate to visually center the circle.
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

const CATEGORIES = Array.from(
  new Set(LANDMARKS.map((l) => l.category))
) as LandmarkCategory[];

export default function MapScreen({ onBack }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [selected, setSelected] = useState<Landmark | null>(null);
  const [activeCategory, setActiveCategory] = useState<LandmarkCategory | 'all'>('all');

  // Init map once
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
      const icon = createMarkerIcon(lm.color, false);
      const marker = L.marker([lm.lat, lm.lng], { icon })
        .addTo(map)
        .on('click', () => {
          setSelected(lm);
        });
      markersRef.current.set(lm.id, marker);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker icons when selection or category changes
  useEffect(() => {
    LANDMARKS.forEach((lm) => {
      const marker = markersRef.current.get(lm.id);
      if (!marker) return;
      const isSelected = selected?.id === lm.id;
      const isFiltered =
        activeCategory !== 'all' && lm.category !== activeCategory;
      const color = isFiltered ? '#cbd5e1' : lm.color;
      marker.setIcon(createMarkerIcon(color, isSelected));
      if (isFiltered) {
        marker.setOpacity(0.4);
      } else {
        marker.setOpacity(1);
      }
    });
  }, [selected, activeCategory]);

  // Fly to selected landmark
  useEffect(() => {
    if (!selected || !mapRef.current) return;
    mapRef.current.flyTo([selected.lat, selected.lng], 16, { duration: 0.8 });
  }, [selected]);

  const filteredList =
    activeCategory === 'all'
      ? LANDMARKS
      : LANDMARKS.filter((l) => l.category === activeCategory);

  const handleLandmarkTap = (lm: Landmark) => {
    setSelected(lm);
  };

  const handleClose = () => {
    setSelected(null);
    mapRef.current?.flyTo(BRATISLAVA_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>
          ← Späť
        </button>
        <div style={styles.headerTitle}>
          <span style={styles.headerIcon}>🗺️</span>
          <div>
            <div style={styles.titleText}>Mapa Bratislavy</div>
            <div style={styles.subtitleText}>Pamätné a významné miesta</div>
          </div>
        </div>
        <div style={styles.countBadge}>{LANDMARKS.length} miest</div>
      </div>

      {/* Category filter */}
      <div style={styles.filterBar}>
        <button
          style={{
            ...styles.filterChip,
            ...(activeCategory === 'all' ? styles.filterChipActive : {}),
          }}
          onClick={() => { setActiveCategory('all'); setSelected(null); }}
        >
          Všetky
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            style={{
              ...styles.filterChip,
              ...(activeCategory === cat ? styles.filterChipActive : {}),
              ...(activeCategory === cat
                ? { background: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat] }
                : {}),
            }}
            onClick={() => {
              setActiveCategory(cat);
              setSelected(null);
            }}
          >
            {CATEGORY_LABELS[cat].split(' /')[0]}
          </button>
        ))}
      </div>

      {/* Map */}
      <div ref={mapElRef} style={styles.map} />

      {/* Bottom panel */}
      <div style={styles.bottomPanel}>
        {selected ? (
          <DetailPanel landmark={selected} onClose={handleClose} />
        ) : (
          <LandmarkList
            landmarks={filteredList}
            onSelect={handleLandmarkTap}
          />
        )}
      </div>
    </div>
  );
}

/* ── Detail Panel ────────────────────────────────────────────── */
function DetailPanel({
  landmark,
  onClose,
}: {
  landmark: Landmark;
  onClose: () => void;
}) {
  return (
    <div style={detailStyles.container}>
      <div style={detailStyles.topRow}>
        <div style={detailStyles.left}>
          <span
            style={{
              ...detailStyles.categoryBadge,
              background: landmark.color + '22',
              color: landmark.color,
              borderColor: landmark.color + '55',
            }}
          >
            {landmark.icon} {CATEGORY_LABELS[landmark.category]}
          </span>
          <h2 style={detailStyles.name}>{landmark.name}</h2>
          <div style={detailStyles.address}>📍 {landmark.address}</div>
          {landmark.built && (
            <div style={detailStyles.built}>🏗️ Postavené: {landmark.built}</div>
          )}
        </div>
        <button style={detailStyles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>
      <div style={detailStyles.description}>{landmark.description}</div>
    </div>
  );
}

/* ── Landmark List ───────────────────────────────────────────── */
function LandmarkList({
  landmarks,
  onSelect,
}: {
  landmarks: Landmark[];
  onSelect: (l: Landmark) => void;
}) {
  return (
    <div style={listStyles.container}>
      <div style={listStyles.label}>Kliknite na miesto alebo vyberte zo zoznamu</div>
      <div style={listStyles.scroll}>
        {landmarks.map((lm) => (
          <button
            key={lm.id}
            style={listStyles.card}
            onClick={() => onSelect(lm)}
          >
            <div
              style={{
                ...listStyles.dot,
                background: lm.color,
              }}
            >
              {lm.icon}
            </div>
            <div style={listStyles.cardText}>
              <div style={listStyles.cardName}>{lm.name}</div>
              <div style={listStyles.cardCat}>
                {CATEGORY_LABELS[lm.category]}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#f0f6ff',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px 32px',
    background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
    flexShrink: 0,
  },
  backBtn: {
    background: 'rgba(255,255,255,0.15)',
    border: '2px solid rgba(255,255,255,0.3)',
    color: '#fff',
    borderRadius: '12px',
    padding: '12px 20px',
    fontSize: '20px',
    fontWeight: 700,
    cursor: 'pointer',
    flexShrink: 0,
  },
  headerTitle: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerIcon: {
    fontSize: '44px',
  },
  titleText: {
    fontSize: '34px',
    fontWeight: 900,
    color: '#fff',
    lineHeight: 1.1,
  },
  subtitleText: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.75)',
    fontWeight: 500,
  },
  countBadge: {
    background: 'rgba(255,255,255,0.2)',
    border: '2px solid rgba(255,255,255,0.3)',
    color: '#fff',
    borderRadius: '20px',
    padding: '8px 20px',
    fontSize: '18px',
    fontWeight: 700,
    flexShrink: 0,
  },
  filterBar: {
    display: 'flex',
    gap: '10px',
    padding: '14px 24px',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    overflowX: 'auto',
    flexShrink: 0,
  },
  filterChip: {
    flexShrink: 0,
    padding: '10px 20px',
    borderRadius: '24px',
    border: '2px solid #e2e8f0',
    background: '#f8fafc',
    color: '#475569',
    fontSize: '18px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  filterChipActive: {
    background: '#2563eb',
    borderColor: '#2563eb',
    color: '#fff',
  },
  map: {
    flex: 1,
    minHeight: 0,
  },
  bottomPanel: {
    height: '560px',
    flexShrink: 0,
    background: '#fff',
    borderTop: '3px solid #e2e8f0',
    overflow: 'hidden',
  },
};

const detailStyles: Record<string, React.CSSProperties> = {
  container: {
    padding: '28px 36px',
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
  },
  left: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 16px',
    borderRadius: '20px',
    border: '1.5px solid',
    fontSize: '17px',
    fontWeight: 700,
    alignSelf: 'flex-start',
  },
  name: {
    fontSize: '38px',
    fontWeight: 900,
    color: '#1e293b',
    lineHeight: 1.1,
  },
  address: {
    fontSize: '19px',
    color: '#64748b',
    fontWeight: 500,
  },
  built: {
    fontSize: '18px',
    color: '#94a3b8',
    fontWeight: 500,
  },
  closeBtn: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    background: '#f1f5f9',
    border: '2px solid #e2e8f0',
    fontSize: '22px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  description: {
    fontSize: '21px',
    color: '#334155',
    lineHeight: 1.65,
    flex: 1,
  },
};

const listStyles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '18px',
    color: '#94a3b8',
    fontWeight: 600,
    padding: '16px 32px 12px',
    borderBottom: '1px solid #f1f5f9',
    flexShrink: 0,
  },
  scroll: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '8px 24px',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    padding: '16px 20px',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.12s',
    flexShrink: 0,
  },
  dot: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0,
    border: '3px solid rgba(255,255,255,0.6)',
  },
  cardText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  cardName: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1e293b',
  },
  cardCat: {
    fontSize: '17px',
    color: '#64748b',
    fontWeight: 500,
  },
};
