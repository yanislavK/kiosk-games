import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PARKING_LOTS, type ParkingLot } from '../data/bratislavaParkingZones';

interface Props { onBack: () => void }

// Bratislava centre — shows most PAAS zones
const MAP_CENTER: [number, number] = [48.1456, 17.1108];
const DEFAULT_ZOOM = 13;

// ── PAAS zone type (comes from /api/paas-zones) ───────────────
export interface PAASZone {
  id: number;
  code: string;
  fullCode: string;
  color: string;
  pricePerHour: number;
  name: string;
  hours: string;
  rings: [number, number][][];
}

// ── Payment flow ──────────────────────────────────────────────
type PayStep = 'none' | 'plate' | 'duration' | 'summary' | 'success';

interface Payment {
  zoneName: string;
  zoneCode: string;
  color: string;
  pricePerHour: number;
  plate: string;
  durationMinutes: number;
  totalPrice: number;
  code: string;
  paidAt: Date | null;
}

const DURATION_OPTS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hod',  minutes: 60 },
  { label: '2 hod',  minutes: 120 },
  { label: '3 hod',  minutes: 180 },
  { label: '4 hod',  minutes: 240 },
  { label: 'Celý deň', minutes: 480 },
];

const REGIONS = [
  'BA','BL','SC','PK','MA','TT','NR','ZA','BB','PO','KE',
  'TN','NM','LC','ZI','ZK','ZL','ZM','ZV','DS','GA','MI',
  'MY','NZ','PE','PB','PD','PT','RA','RK','SA','SE','SI',
  'SK','SL','SN','SO','TA','TO','TS','TV','VK',
];

function calcPrice(price: number, minutes: number) {
  return Math.round((price * minutes / 60) * 100) / 100;
}

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = 'P';
  for (let i = 0; i < 7; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

function lotIcon(color: string, sel: boolean): L.DivIcon {
  const sz = sel ? 52 : 40;
  return L.divIcon({
    className: '',
    html: `<div style="width:${sz}px;height:${sz}px;background:${color};color:#fff;border-radius:10px;border:${sel ? '4px' : '3px'} solid #fff;box-shadow:0 3px 14px rgba(0,0,0,.45)${sel ? `,0 0 0 3px ${color}` : ''};transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;font-size:${sel ? 24 : 18}px;font-weight:900;cursor:pointer;font-family:sans-serif;">P</div>`,
    iconSize: [0, 0], iconAnchor: [0, 0],
  });
}

// ── Price tier legend ─────────────────────────────────────────
const PRICE_LEGEND = [
  { label: '€2.00/hod', color: '#be123c', desc: 'Centrum SM0' },
  { label: '€1.50/hod', color: '#dc2626', desc: 'Staré Mesto' },
  { label: '€1.00/hod', color: '#ea580c', desc: 'NM, RU1, PE1' },
  { label: '€0.50/hod', color: '#ca8a04', desc: 'Okrajové zóny' },
];

export default function ParkingScreen({ onBack }: Props) {
  const mapRef    = useRef<L.Map | null>(null);
  const mapElRef  = useRef<HTMLDivElement>(null);
  const lotRefs   = useRef<Map<string, L.Marker>>(new Map());
  const zoneLayer = useRef<L.LayerGroup | null>(null);

  const [paasZones,  setPaasZones]  = useState<PAASZone[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState<string | null>(null);

  const [selZone, setSelZone] = useState<PAASZone | null>(null);
  const [selLot,  setSelLot]  = useState<ParkingLot | null>(null);
  const [payStep, setPayStep] = useState<PayStep>('none');
  const [payment, setPayment] = useState<Payment>({
    zoneName: '', zoneCode: '', color: '#2563eb', pricePerHour: 1,
    plate: '', durationMinutes: 60, totalPrice: 0, code: '', paidAt: null,
  });

  // Plate input
  const [pRegion, setPRegion] = useState('BA');
  const [pDigits, setPDigits] = useState('');
  const [pSuffix, setPSuffix] = useState('');
  const [pField,  setPField]  = useState<'digits' | 'suffix'>('digits');

  // ── Fetch PAAS zones from API ─────────────────────────────
  useEffect(() => {
    fetch('/api/paas-zones')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setPaasZones(d.zones ?? []);
        setLoading(false);
      })
      .catch(e => {
        setLoadError(String(e));
        setLoading(false);
      });
  }, []);

  // ── Init map ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    const map = L.map(mapElRef.current, { center: MAP_CENTER, zoom: DEFAULT_ZOOM, zoomControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    zoneLayer.current = L.layerGroup().addTo(map);

    // Parking lot markers
    PARKING_LOTS.forEach((lot) => {
      const mk = L.marker([lot.lat, lot.lng], { icon: lotIcon('#475569', false) })
        .addTo(map).on('click', () => {
          setSelLot(lot); setSelZone(null); setPayStep('none');
          map.flyTo([lot.lat, lot.lng], 16, { duration: 0.6 });
        });
      lotRefs.current.set(lot.id, mk);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── Draw PAAS zone polygons once loaded ───────────────────
  useEffect(() => {
    if (!mapRef.current || !zoneLayer.current || !paasZones.length) return;
    zoneLayer.current.clearLayers();

    paasZones.forEach((zone) => {
      // Handle multi-ring polygons: first ring = outer, rest = holes
      // For zones with multiple outer rings, draw each as separate polygon
      zone.rings.forEach((ring, ri) => {
        L.polygon(ring, {
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: ri === 0 ? 0.20 : 0.05,
          weight: 2,
          opacity: 0.85,
        })
          .addTo(zoneLayer.current!)
          .on('click', () => {
            setSelZone(zone); setSelLot(null); setPayStep('none');
          });
      });
    });
  }, [paasZones]);

  // ── Highlight selected zone ───────────────────────────────
  // Zone highlight handled by polygon re-draw in paasZones effect

  // Update lot icon on selection change
  useEffect(() => {
    PARKING_LOTS.forEach((lot) => {
      const color = selLot?.id === lot.id ? '#1e293b' : '#475569';
      lotRefs.current.get(lot.id)?.setIcon(lotIcon(color, selLot?.id === lot.id));
    });
  }, [selLot]);

  const handleClose = useCallback(() => {
    setSelZone(null); setSelLot(null); setPayStep('none');
    mapRef.current?.flyTo(MAP_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
  }, []);

  const startPayment = useCallback((name: string, code: string, color: string, price: number) => {
    setPayment(p => ({ ...p, zoneName: name, zoneCode: code, color, pricePerHour: price, durationMinutes: 60 }));
    setPDigits(''); setPSuffix(''); setPField('digits');
    setPayStep('plate');
  }, []);

  const handleKey = useCallback((ch: string) => {
    if (pField === 'digits') {
      if (ch === '⌫') { setPDigits(d => d.slice(0, -1)); return; }
      if (pDigits.length < 3) {
        const nd = pDigits + ch;
        setPDigits(nd);
        if (nd.length === 3) setPField('suffix');
      }
    } else {
      if (ch === '⌫') { setPSuffix(s => s.slice(0, -1)); return; }
      if (pSuffix.length < 2) setPSuffix(s => s + ch);
    }
  }, [pField, pDigits, pSuffix]);

  const plateOk = pDigits.length === 3 && pSuffix.length === 2;

  const confirmPayment = useCallback(() => {
    const plate = `${pRegion} ${pDigits} ${pSuffix}`;
    const price = calcPrice(payment.pricePerHour, payment.durationMinutes);
    setPayment(p => ({ ...p, plate, totalPrice: price, code: genCode(), paidAt: new Date() }));
    setPayStep('success');
  }, [pRegion, pDigits, pSuffix, payment]);

  const panelH = payStep === 'plate' ? 870 : payStep === 'none' ? 520 : 640;

  const renderPanel = () => {
    if (payStep === 'plate')    return <PlateStep    pRegion={pRegion} setPRegion={setPRegion} pDigits={pDigits} pSuffix={pSuffix} pField={pField} setPField={setPField} handleKey={handleKey} plateOk={plateOk} payment={payment} onNext={() => setPayStep('duration')} onBack={() => setPayStep('none')} />;
    if (payStep === 'duration') return <DurationStep payment={payment} setPayment={setPayment} onNext={() => setPayStep('summary')} onBack={() => setPayStep('plate')} />;
    if (payStep === 'summary')  return <SummaryStep  payment={payment} pRegion={pRegion} pDigits={pDigits} pSuffix={pSuffix} onConfirm={confirmPayment} onBack={() => setPayStep('duration')} />;
    if (payStep === 'success')  return <SuccessStep  payment={payment} onDone={handleClose} />;
    if (selZone) return (
      <ZoneDetail
        name={selZone.name} code={selZone.code} fullCode={selZone.fullCode}
        color={selZone.color} price={selZone.pricePerHour} hours={selZone.hours}
        onClose={handleClose}
        onPay={() => startPayment(selZone.name, selZone.code, selZone.color, selZone.pricePerHour)}
      />
    );
    if (selLot) return (
      <ZoneDetail
        name={selLot.name} code={selLot.zone} fullCode={selLot.address}
        color='#475569' price={selLot.pricePerHour} hours={selLot.openHours}
        address={selLot.address} capacity={selLot.capacity} lotType={selLot.type}
        onClose={handleClose}
        onPay={() => startPayment(selLot.name, selLot.zone, '#475569', selLot.pricePerHour)}
      />
    );
    return <ZoneOverview zones={paasZones} loading={loading} error={loadError} />;
  };

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Späť</button>
        <div style={s.htitle}>
          <span style={{ fontSize: 36 }}>🅿️</span>
          <div>
            <div style={s.title}>Parkovanie PAAS – Bratislava</div>
            <div style={s.sub}>Bratislavský parkovací asistent · paas.sk</div>
          </div>
        </div>
        {/* Price legend */}
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          {PRICE_LEGEND.map(l => (
            <div key={l.label} style={{ ...s.legendPill, background: l.color }} title={l.desc}>{l.label}</div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div ref={mapElRef} style={s.map} />

      {/* Bottom panel */}
      <div style={{ ...s.panel, height: panelH }}>
        {renderPanel()}
      </div>
    </div>
  );
}

/* ── Zone overview ───────────────────────────────────────────── */
function ZoneOverview({ zones, loading, error }: { zones: PAASZone[]; loading: boolean; error: string | null }) {
  if (loading) return (
    <div style={ov.centered}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#475569' }}>Načítavajú sa PAAS zóny…</div>
      <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 6 }}>Dáta z ArcGIS · Bratislava</div>
    </div>
  );
  if (error) return (
    <div style={ov.centered}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#dc2626' }}>Nepodarilo sa načítať zóny</div>
      <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, maxWidth: 500, textAlign: 'center' }}>{error}</div>
    </div>
  );

  // Group by district for summary
  const districts: Record<string, { count: number; color: string; price: number }> = {};
  zones.forEach(z => {
    const prefix = z.code.replace(/\d.*/, ''); // SM, NM, RU, etc.
    if (!districts[prefix]) districts[prefix] = { count: 0, color: z.color, price: z.pricePerHour };
    districts[prefix].count++;
  });

  return (
    <div style={ov.wrap}>
      <div style={ov.hint}>
        🅿️ Načítaných <strong>{zones.length}</strong> aktívnych PAAS zón · Kliknite na zónu na mape
      </div>
      <div style={ov.districtRow}>
        {Object.entries(districts).map(([prefix, d]) => (
          <div key={prefix} style={{ ...ov.districtChip, borderColor: d.color }}>
            <div style={{ ...ov.districtDot, background: d.color }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{prefix}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{d.count} zón · od €{d.price.toFixed(2)}/h</div>
            </div>
          </div>
        ))}
      </div>
      <div style={ov.priceRow}>
        {PRICE_LEGEND.map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: l.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{l.label}</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>– {l.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Zone / Lot detail ───────────────────────────────────────── */
function ZoneDetail({ name, code, fullCode, color, price, hours, address, capacity, lotType, onClose, onPay }: {
  name: string; code: string; fullCode: string; color: string;
  price: number; hours: string; address?: string; capacity?: number;
  lotType?: string; onClose: () => void; onPay: () => void;
}) {
  return (
    <div style={zd.wrap}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <button style={zd.backBtn} onClick={onClose}>← Späť</button>
        <div style={{ ...zd.badge, background: color }}>
          {address ? '🅿️ Parkovisko' : `Zóna ${code}`}
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 28, fontWeight: 900, color }}>
          €{price.toFixed(2)}<span style={{ fontSize: 15, color: '#64748b' }}>/hod</span>
        </span>
      </div>

      <h3 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{name}</h3>

      {address && <div style={zd.meta}>📍 {address}</div>}
      {capacity && <div style={zd.meta}>{lotType === 'garage' ? '🏢 Garáž' : '🅿️ Parkovisko'} · 🚗 {capacity} miest</div>}
      {!address && fullCode !== code && <div style={zd.meta}>📌 Kódy: {fullCode}</div>}
      <div style={zd.meta}>⏰ {hours}</div>

      <button style={{ ...zd.payBtn, background: color }} onClick={onPay}>
        💳 Zaplatiť parkovanie
      </button>
    </div>
  );
}

/* ── Plate step ──────────────────────────────────────────────── */
function PlateStep({ pRegion, setPRegion, pDigits, pSuffix, pField, setPField, handleKey, plateOk, payment, onNext, onBack }: {
  pRegion: string; setPRegion: (r: string) => void;
  pDigits: string; pSuffix: string;
  pField: 'digits' | 'suffix'; setPField: (f: 'digits' | 'suffix') => void;
  handleKey: (ch: string) => void;
  plateOk: boolean; payment: Payment;
  onNext: () => void; onBack: () => void;
}) {
  return (
    <div style={st.wrap}>
      <StepHeader step={1} label="Zadajte ŠPZ vozidla" color={payment.color} onBack={onBack} />

      <div style={st.previewWrap}>
        <div style={st.plate}>
          <div style={st.plateFlag}>🇸🇰<br /><span style={{ fontSize: 13, letterSpacing: 1 }}>SK</span></div>
          <div style={st.plateNum}>
            <span style={{ color: '#1e40af', fontWeight: 900 }}>{pRegion}</span>
            <span style={{ color: '#111' }}>{' '}{pDigits || <span style={{ opacity: 0.3 }}>000</span>}</span>
            <span style={{ color: '#111', opacity: pSuffix ? 1 : 0.4 }}>{' '}{pSuffix || 'AA'}</span>
          </div>
        </div>
      </div>

      <div style={st.regionRow}>
        <span style={st.fieldLabel}>Kraj:</span>
        <div style={st.regionScroll}>
          {REGIONS.map(r => (
            <button key={r} style={{ ...st.regBtn, ...(pRegion === r ? st.regBtnActive : {}) }}
              onClick={() => setPRegion(r)}>{r}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <button style={{ ...st.tab, ...(pField === 'digits' ? { ...st.tabActive, background: payment.color, borderColor: payment.color } : {}) }}
          onClick={() => setPField('digits')}>
          🔢 Čísla ({pDigits.length}/3)
        </button>
        <button style={{ ...st.tab, ...(pField === 'suffix' ? { ...st.tabActive, background: payment.color, borderColor: payment.color } : {}), ...(pDigits.length < 3 ? { opacity: 0.4 } : {}) }}
          onClick={() => { if (pDigits.length === 3) setPField('suffix'); }}
          disabled={pDigits.length < 3}>
          🔡 Písmená ({pSuffix.length}/2)
        </button>
      </div>

      {pField === 'digits' ? (
        <div style={st.numpad}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) =>
            k === '' ? <div key={i} /> :
            <button key={i} style={k === '⌫' ? { ...st.key, ...st.keyDel } : st.key}
              onClick={() => handleKey(k)}>{k}</button>
          )}
        </div>
      ) : (
        <div style={st.alphapad}>
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((k, i) => (
            <button key={i} style={st.keyAlpha} onClick={() => handleKey(k)}>{k}</button>
          ))}
          <button style={{ ...st.keyAlpha, ...st.keyDel, gridColumn: 'span 2' }} onClick={() => handleKey('⌫')}>⌫</button>
        </div>
      )}

      <button style={{ ...st.nextBtn, background: payment.color, ...(plateOk ? {} : { opacity: 0.35 }) }}
        disabled={!plateOk} onClick={onNext}>Ďalej →</button>
    </div>
  );
}

/* ── Duration step ───────────────────────────────────────────── */
function DurationStep({ payment, setPayment, onNext, onBack }: {
  payment: Payment; setPayment: React.Dispatch<React.SetStateAction<Payment>>;
  onNext: () => void; onBack: () => void;
}) {
  return (
    <div style={st.wrap}>
      <StepHeader step={2} label="Zvoľte dobu parkovania" color={payment.color} onBack={onBack} />
      <div style={dur.grid}>
        {DURATION_OPTS.map(opt => {
          const price = calcPrice(payment.pricePerHour, opt.minutes);
          const active = payment.durationMinutes === opt.minutes;
          return (
            <button key={opt.minutes}
              style={{ ...dur.btn, ...(active ? { background: payment.color, borderColor: payment.color, color: '#fff', transform: 'scale(1.04)' } : {}) }}
              onClick={() => setPayment(p => ({ ...p, durationMinutes: opt.minutes }))}>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{opt.label}</div>
              <div style={{ fontSize: 21, fontWeight: 700, marginTop: 4, opacity: active ? 1 : 0.8 }}>€{price.toFixed(2)}</div>
            </button>
          );
        })}
      </div>
      <button style={{ ...st.nextBtn, background: payment.color }} onClick={onNext}>Pokračovať →</button>
    </div>
  );
}

/* ── Summary step ────────────────────────────────────────────── */
function SummaryStep({ payment, pRegion, pDigits, pSuffix, onConfirm, onBack }: {
  payment: Payment; pRegion: string; pDigits: string; pSuffix: string;
  onConfirm: () => void; onBack: () => void;
}) {
  const plate = `${pRegion} ${pDigits} ${pSuffix}`;
  const price = calcPrice(payment.pricePerHour, payment.durationMinutes);
  const durOpt = DURATION_OPTS.find(o => o.minutes === payment.durationMinutes);
  return (
    <div style={st.wrap}>
      <StepHeader step={3} label="Súhrn platby" color={payment.color} onBack={onBack} />
      <div style={sum.card}>
        <SumRow label="🅿️ Lokalita" val={payment.zoneName} />
        <SumRow label="📌 Kód zóny" val={payment.zoneCode} />
        <SumRow label="🚗 ŠPZ"     val={plate} mono />
        <SumRow label="⏱️ Doba"    val={durOpt?.label ?? '–'} />
        <SumRow label="💶 Sadzba"  val={`€${payment.pricePerHour.toFixed(2)}/hod`} />
        <div style={{ borderTop: '2px solid #e2e8f0', marginTop: 8, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>💳 Spolu</span>
          <span style={{ fontSize: 36, fontWeight: 900, color: payment.color }}>€{price.toFixed(2)}</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginBottom: 10 }}>
        Demo kiosk – platba je simulovaná. Zdroj zón: paas.sk / Bratislava ArcGIS.
      </div>
      <button style={{ ...st.nextBtn, background: payment.color, fontSize: 21, padding: '18px 0' }} onClick={onConfirm}>
        ✅ Potvrdiť a zaplatiť €{price.toFixed(2)}
      </button>
    </div>
  );
}

/* ── Success step ────────────────────────────────────────────── */
function SuccessStep({ payment, onDone }: { payment: Payment; onDone: () => void }) {
  const validUntil = payment.paidAt
    ? new Date(payment.paidAt.getTime() + payment.durationMinutes * 60000)
    : null;
  return (
    <div style={st.wrap}>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 72, lineHeight: 1 }}>✅</div>
        <div style={{ fontSize: 27, fontWeight: 900, color: '#16a34a', marginTop: 8 }}>Platba úspešná!</div>
        <div style={{ fontSize: 15, color: '#64748b', marginTop: 4 }}>Vaše parkovanie je zaregistrované v systéme PAAS.</div>
      </div>
      <div style={{ ...sum.card, borderColor: '#bbf7d0', background: '#f0fdf4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1.5px solid #bbf7d0' }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const }}>Kód potvrdenia</span>
          <span style={{ fontSize: 24, fontWeight: 900, fontFamily: 'monospace', color: '#16a34a', letterSpacing: 3 }}>{payment.code}</span>
        </div>
        <SumRow label="📌 Zóna"       val={`${payment.zoneCode} – ${payment.zoneName}`} />
        <SumRow label="🚗 ŠPZ"        val={payment.plate} mono />
        <SumRow label="💶 Zaplatené"  val={`€${payment.totalPrice.toFixed(2)}`} green />
        {validUntil && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <span style={{ fontSize: 15, color: '#64748b', fontWeight: 600 }}>⏱️ Platí do</span>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#dc2626' }}>
              {validUntil.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: '10px 0' }}>
        V prípade kontroly ukážte kód inšpektorovi PAAS alebo ho zapíšte na viditeľné miesto.
      </div>
      <button style={{ ...st.nextBtn, background: '#16a34a' }} onClick={onDone}>🗺️ Späť na mapu</button>
    </div>
  );
}

/* ── Shared ──────────────────────────────────────────────────── */
function StepHeader({ step, label, color, onBack }: { step: number; label: string; color: string; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, flexShrink: 0 }}>
      <button style={st.backSmall} onClick={onBack}>← Späť</button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1 }}>Krok {step} / 3</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: '#1e293b' }}>{label}</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1,2,3].map(i => <div key={i} style={{ width: 32, height: 6, borderRadius: 3, background: i <= step ? color : '#e2e8f0' }} />)}
      </div>
    </div>
  );
}

function SumRow({ label, val, mono, green }: { label: string; val: string; mono?: boolean; green?: boolean }) {
  return (
    <div style={sum.row}>
      <span style={sum.label}>{label}</span>
      <span style={{ ...sum.val, ...(mono ? { fontFamily: 'monospace', fontSize: 17 } : {}), ...(green ? { color: '#16a34a', fontWeight: 800 } : {}) }}>{val}</span>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', background: '#f0f4ff' },
  header:    { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', flexShrink: 0 },
  backBtn:   { background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 12, padding: '10px 16px', fontSize: 18, fontWeight: 700, cursor: 'pointer', flexShrink: 0 },
  htitle:    { flex: 1, display: 'flex', alignItems: 'center', gap: 12 },
  title:     { fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1.1 },
  sub:       { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 },
  legendPill:{ padding: '4px 10px', borderRadius: 20, color: '#fff', fontSize: 12, fontWeight: 800, border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 },
  map:       { flex: 1, minHeight: 0 },
  panel:     { flexShrink: 0, background: '#fff', borderTop: '3px solid #e2e8f0', overflow: 'hidden', transition: 'height 0.25s ease' },
};

const ov: Record<string, React.CSSProperties> = {
  wrap:         { display: 'flex', flexDirection: 'column', height: '100%', padding: '14px 20px', gap: 12 },
  centered:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 },
  hint:         { fontSize: 15, color: '#475569', fontWeight: 600, textAlign: 'center' },
  districtRow:  { display: 'flex', flexWrap: 'wrap', gap: 10 },
  districtChip: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8fafc', border: '2px solid', borderRadius: 14 },
  districtDot:  { width: 18, height: 18, borderRadius: 4, flexShrink: 0 },
  priceRow:     { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #f1f5f9' },
};

const zd: Record<string, React.CSSProperties> = {
  wrap:    { padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 8, height: '100%' },
  backBtn: { padding: '8px 16px', borderRadius: 12, border: '2px solid #e2e8f0', background: '#f8fafc', fontWeight: 700, fontSize: 16, cursor: 'pointer', flexShrink: 0 },
  badge:   { padding: '6px 18px', borderRadius: 20, color: '#fff', fontSize: 16, fontWeight: 800 },
  meta:    { fontSize: 15, color: '#64748b', fontWeight: 500 },
  payBtn:  { marginTop: 'auto', padding: '18px 0', borderRadius: 16, border: 'none', color: '#fff', fontSize: 21, fontWeight: 900, cursor: 'pointer', width: '100%' },
};

const st: Record<string, React.CSSProperties> = {
  wrap:       { display: 'flex', flexDirection: 'column', height: '100%', padding: '14px 20px 12px' },
  backSmall:  { padding: '8px 16px', borderRadius: 12, border: '2px solid #e2e8f0', background: '#f8fafc', fontWeight: 700, fontSize: 16, cursor: 'pointer', flexShrink: 0 },
  previewWrap:{ display: 'flex', justifyContent: 'center', marginBottom: 12, flexShrink: 0 },
  plate:      { display: 'flex', alignItems: 'center', background: '#fff', border: '3px solid #1e293b', borderRadius: 10, overflow: 'hidden', height: 88, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' },
  plateFlag:  { background: '#1e40af', color: '#fff', width: 68, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, flexShrink: 0 },
  plateNum:   { fontSize: 38, fontWeight: 900, letterSpacing: 4, padding: '0 24px', fontFamily: '"Arial Black", sans-serif', color: '#1e293b' },
  regionRow:  { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexShrink: 0 },
  fieldLabel: { fontSize: 15, fontWeight: 700, color: '#475569', flexShrink: 0 },
  regionScroll:{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1, paddingBottom: 4 },
  regBtn:     { padding: '7px 13px', borderRadius: 12, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0 },
  regBtnActive:{ background: '#2563eb', borderColor: '#2563eb', color: '#fff' },
  tab:        { flex: 1, padding: '10px 0', borderRadius: 12, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  tabActive:  { color: '#fff' },
  numpad:     { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12, flexShrink: 0 },
  alphapad:   { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, marginBottom: 12, flexShrink: 0 },
  key:        { padding: '14px 0', borderRadius: 12, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: 24, fontWeight: 800, cursor: 'pointer', textAlign: 'center' as const },
  keyAlpha:   { padding: '10px 0', borderRadius: 10, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: 18, fontWeight: 700, cursor: 'pointer', textAlign: 'center' as const },
  keyDel:     { background: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626' },
  nextBtn:    { padding: '16px 0', borderRadius: 16, border: 'none', color: '#fff', fontSize: 20, fontWeight: 900, cursor: 'pointer', width: '100%', marginTop: 'auto', flexShrink: 0 },
};

const dur: Record<string, React.CSSProperties> = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, flex: 1, marginBottom: 12 },
  btn:  { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 8px', borderRadius: 16, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', cursor: 'pointer', transition: 'all 0.15s' },
};

const sum: Record<string, React.CSSProperties> = {
  card:  { background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 16, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 },
  row:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 15, color: '#64748b', fontWeight: 600 },
  val:   { fontSize: 17, fontWeight: 700, color: '#1e293b' },
};
