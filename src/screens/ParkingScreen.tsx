import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  PARKING_ZONES, PARKING_LOTS, ZONE_COLORS,
  type ParkingZone, type ParkingLot,
} from '../data/bratislavaParkingZones';

interface Props { onBack: () => void }

const MAP_CENTER: [number, number] = [48.1456, 17.1200];
const DEFAULT_ZOOM = 13;

type PayStep = 'none' | 'plate' | 'duration' | 'summary' | 'success';

interface Payment {
  zone: ParkingZone | null;
  lot: ParkingLot | null;
  plate: string;
  durationMinutes: number;
  totalPrice: number;
  code: string;
  paidAt: Date | null;
}

const DURATION_OPTS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hod', minutes: 60 },
  { label: '2 hod', minutes: 120 },
  { label: '3 hod', minutes: 180 },
  { label: '4 hod', minutes: 240 },
  { label: 'Celý deň', minutes: 480 },
];

const REGIONS = [
  'BA','BL','SC','PK','MA','TT','TA','NR','ZA','BB','PO','KE',
  'TN','NM','LC','ZI','ZK','ZL','ZM','ZV','DS','GA','IL','KA',
  'KN','LM','LV','MI','MY','NO','NZ','PE','PB','PD','PT','RA',
  'RK','SA','SE','SI','SK','SL','SN','SO','SP','SV','TO','TS','TV','VK',
];

function calcPrice(zone: ParkingZone | null, lot: ParkingLot | null, minutes: number) {
  const rate = lot ? lot.pricePerHour : (zone?.pricePerHour ?? 1.00);
  const freeMin = zone?.freeMinutes ?? 0;
  const billable = Math.max(0, minutes - freeMin);
  return Math.round((rate * billable / 60) * 100) / 100;
}

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = 'P';
  for (let i = 0; i < 7; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

function lotIcon(zone: 'A' | 'B' | 'C', sel: boolean): L.DivIcon {
  const color = ZONE_COLORS[zone];
  const sz = sel ? 52 : 40;
  return L.divIcon({
    className: '',
    html: `<div style="width:${sz}px;height:${sz}px;background:${color};color:#fff;border-radius:10px;border:${sel ? '4px' : '3px'} solid #fff;box-shadow:0 3px 14px rgba(0,0,0,.45)${sel ? `,0 0 0 3px ${color}` : ''};transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;font-size:${sel ? 24 : 18}px;font-weight:900;cursor:pointer;font-family:sans-serif;">P</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function ParkingScreen({ onBack }: Props) {
  const mapRef     = useRef<L.Map | null>(null);
  const mapElRef   = useRef<HTMLDivElement>(null);
  const lotRefs    = useRef<Map<string, L.Marker>>(new Map());
  const zonePolys  = useRef<Map<string, L.Polygon>>(new Map());

  const [selZone, setSelZone]   = useState<ParkingZone | null>(null);
  const [selLot,  setSelLot]    = useState<ParkingLot  | null>(null);
  const [payStep, setPayStep]   = useState<PayStep>('none');
  const [payment, setPayment]   = useState<Payment>({ zone: null, lot: null, plate: '', durationMinutes: 60, totalPrice: 0, code: '', paidAt: null });

  // Plate input
  const [pRegion,  setPRegion]  = useState('BA');
  const [pDigits,  setPDigits]  = useState('');
  const [pSuffix,  setPSuffix]  = useState('');
  const [pField,   setPField]   = useState<'digits' | 'suffix'>('digits');

  // ── Map init ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    const map = L.map(mapElRef.current, { center: MAP_CENTER, zoom: DEFAULT_ZOOM, zoomControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Zone polygons
    PARKING_ZONES.forEach((zone) => {
      const poly = L.polygon(zone.polygon, {
        color: zone.color, fillColor: zone.color,
        fillOpacity: 0.18, weight: 2.5, opacity: 0.85,
      }).addTo(map).on('click', () => {
        setSelZone(zone); setSelLot(null); setPayStep('none');
      });
      zonePolys.current.set(zone.id, poly);
    });

    // Parking lot markers
    PARKING_LOTS.forEach((lot) => {
      const mk = L.marker([lot.lat, lot.lng], { icon: lotIcon(lot.zone, false) })
        .addTo(map).on('click', () => {
          const z = PARKING_ZONES.find(z => z.code === lot.zone) ?? null;
          setSelLot(lot); setSelZone(z); setPayStep('none');
          map.flyTo([lot.lat, lot.lng], 16, { duration: 0.6 });
        });
      lotRefs.current.set(lot.id, mk);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Update lot marker icons on selection change
  useEffect(() => {
    PARKING_LOTS.forEach((lot) => {
      lotRefs.current.get(lot.id)?.setIcon(lotIcon(lot.zone, selLot?.id === lot.id));
    });
  }, [selLot]);

  // Highlight selected zone polygon
  useEffect(() => {
    PARKING_ZONES.forEach((zone) => {
      const poly = zonePolys.current.get(zone.id);
      if (!poly) return;
      const active = selZone?.id === zone.id;
      poly.setStyle({ weight: active ? 4 : 2.5, fillOpacity: active ? 0.30 : 0.18 });
    });
  }, [selZone]);

  const handleClose = useCallback(() => {
    setSelZone(null); setSelLot(null); setPayStep('none');
    mapRef.current?.flyTo(MAP_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
  }, []);

  const startPayment = useCallback(() => {
    setPayment(p => ({ ...p, zone: selZone, lot: selLot, durationMinutes: 60 }));
    setPDigits(''); setPSuffix(''); setPField('digits');
    setPayStep('plate');
  }, [selZone, selLot]);

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
  const zone = payment.zone ?? selZone;

  const confirmPayment = useCallback(() => {
    const plate = `${pRegion} ${pDigits} ${pSuffix}`;
    const price = calcPrice(payment.zone, payment.lot, payment.durationMinutes);
    const code  = genCode();
    setPayment(p => ({ ...p, plate, totalPrice: price, code, paidAt: new Date() }));
    setPayStep('success');
  }, [pRegion, pDigits, pSuffix, payment]);

  // ── Panel height ──────────────────────────────────────────
  const panelH = payStep === 'plate' ? 870 : payStep === 'none' ? 500 : 640;

  // ── Render ────────────────────────────────────────────────
  const renderPanel = () => {
    if (payStep === 'plate')    return <PlateStep    pRegion={pRegion} setPRegion={setPRegion} pDigits={pDigits} pSuffix={pSuffix} pField={pField} setPField={setPField} handleKey={handleKey} plateOk={plateOk} onNext={() => setPayStep('duration')} onBack={() => setPayStep('none')} />;
    if (payStep === 'duration') return <DurationStep payment={payment} setPayment={setPayment} zone={zone} onNext={() => setPayStep('summary')} onBack={() => setPayStep('plate')} />;
    if (payStep === 'summary')  return <SummaryStep  payment={payment} pRegion={pRegion} pDigits={pDigits} pSuffix={pSuffix} zone={zone} onConfirm={confirmPayment} onBack={() => setPayStep('duration')} />;
    if (payStep === 'success')  return <SuccessStep  payment={payment} onDone={handleClose} />;
    if (selZone || selLot)     return <ZoneDetail    zone={selZone} lot={selLot} onClose={handleClose} onPay={startPayment} />;
    return <ZoneList onSelect={(z) => { setSelZone(z); setSelLot(null); }} />;
  };

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Späť</button>
        <div style={s.htitle}>
          <span style={{ fontSize: 38 }}>🅿️</span>
          <div>
            <div style={s.title}>Parkovanie v Bratislave</div>
            <div style={s.sub}>BPK – Bratislavská parkovacia spoločnosť</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {(['A','B','C'] as const).map(c => (
            <div key={c} style={{ ...s.legendPill, background: ZONE_COLORS[c] }}>Zóna {c}</div>
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

/* ── Zone list ──────────────────────────────────────────────── */
function ZoneList({ onSelect }: { onSelect: (z: ParkingZone) => void }) {
  const unique = PARKING_ZONES.filter((z, i, arr) => arr.findIndex(x => x.code === z.code) === i);
  return (
    <div style={zl.wrap}>
      <div style={zl.hint}>🅿️ Kliknite na zónu na mape alebo vyberte zo zoznamu nižšie</div>
      <div style={zl.cards}>
        {unique.map(zone => (
          <button key={zone.id} style={{ ...zl.card, borderLeft: `7px solid ${zone.color}` }} onClick={() => onSelect(zone)}>
            <div style={{ ...zl.badge, background: zone.color }}>Zóna {zone.code}</div>
            <div style={zl.name}>{zone.name}</div>
            <div style={zl.row}>
              <span style={{ ...zl.price, color: zone.color }}>€{zone.pricePerHour.toFixed(2)}/hod</span>
              {zone.freeMinutes > 0 && <span style={zl.free}>{zone.freeMinutes} min zadarmo</span>}
            </div>
            <div style={zl.hours}>⏰ {zone.hours}</div>
          </button>
        ))}
      </div>
      <div style={zl.hint2}>📍 Na mape sú zobrazené parkoviská (P) a farebné zóny</div>
    </div>
  );
}

/* ── Zone detail ─────────────────────────────────────────────── */
function ZoneDetail({ zone, lot, onClose, onPay }: {
  zone: ParkingZone | null; lot: ParkingLot | null;
  onClose: () => void; onPay: () => void;
}) {
  const z = zone;
  const rate = lot ? lot.pricePerHour : (z?.pricePerHour ?? 0);
  const color = z?.color ?? '#2563eb';
  return (
    <div style={zd.wrap}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <button style={zd.backBtn} onClick={onClose}>← Späť</button>
        {z && <div style={{ ...zd.badge, background: color }}>Zóna {z.code}</div>}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 30, fontWeight: 900, color }}>€{rate.toFixed(2)}<span style={{ fontSize: 16, color: '#64748b' }}>/hod</span></span>
      </div>

      <h3 style={{ margin: '0 0 6px', fontSize: 23, fontWeight: 800, color: '#1e293b' }}>
        {lot ? lot.name : z?.name}
      </h3>

      {lot && (
        <>
          <div style={zd.meta}>📍 {lot.address}</div>
          <div style={zd.meta}>{lot.type === 'garage' ? '🏢 Parkovacia garáž' : '🅿️ Otvorené parkovisko'} · 🚗 {lot.capacity} miest</div>
          <div style={zd.meta}>⏰ {lot.openHours}</div>
        </>
      )}
      {z && !lot && (
        <>
          <div style={zd.meta}>⏰ {z.hours}</div>
          <div style={{ ...zd.meta, marginTop: 4 }}>{z.description}</div>
        </>
      )}
      {(z?.freeMinutes ?? 0) > 0 && (
        <div style={zd.freeBadge}>✅ Prvých {z!.freeMinutes} minút zadarmo</div>
      )}

      <button style={{ ...zd.payBtn, background: color }} onClick={onPay}>
        💳 Zaplatiť parkovanie
      </button>
    </div>
  );
}

/* ── Plate step ──────────────────────────────────────────────── */
function PlateStep({ pRegion, setPRegion, pDigits, pSuffix, pField, setPField, handleKey, plateOk, onNext, onBack }: {
  pRegion: string; setPRegion: (r: string) => void;
  pDigits: string; pSuffix: string;
  pField: 'digits' | 'suffix'; setPField: (f: 'digits' | 'suffix') => void;
  handleKey: (ch: string) => void;
  plateOk: boolean; onNext: () => void; onBack: () => void;
}) {
  return (
    <div style={st.wrap}>
      <StepHeader step={1} label="Zadajte ŠPZ vozidla" onBack={onBack} />

      {/* Plate preview */}
      <div style={st.previewWrap}>
        <div style={st.plate}>
          <div style={st.plateFlag}>🇸🇰<br /><span style={{ fontSize: 13, letterSpacing: 1 }}>SK</span></div>
          <div style={st.plateNum}>
            <span style={{ color: '#1e40af', fontWeight: 900 }}>{pRegion}</span>
            <span style={{ color: '#111' }}>{' '}{pDigits || <span style={{ opacity: 0.3 }}>000</span>}</span>
            <span style={{ color: '#111' }}>{' '}{pSuffix || <span style={{ opacity: 0.3 }}>AA</span>}</span>
          </div>
        </div>
      </div>

      {/* Region scroll */}
      <div style={st.regionRow}>
        <span style={st.fieldLabel}>Kraj:</span>
        <div style={st.regionScroll}>
          {REGIONS.map(r => (
            <button key={r} style={{ ...st.regBtn, ...(pRegion === r ? st.regBtnActive : {}) }}
              onClick={() => setPRegion(r)}>{r}</button>
          ))}
        </div>
      </div>

      {/* Field tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <button style={{ ...st.tab, ...(pField === 'digits' ? st.tabActive : {}) }} onClick={() => setPField('digits')}>
          🔢 Čísla &nbsp;<span style={{ opacity: 0.7 }}>({pDigits.length}/3)</span>
        </button>
        <button style={{ ...st.tab, ...(pField === 'suffix' ? st.tabActive : {}), ...(pDigits.length < 3 ? { opacity: 0.4 } : {}) }}
          onClick={() => { if (pDigits.length === 3) setPField('suffix'); }}
          disabled={pDigits.length < 3}>
          🔡 Písmená &nbsp;<span style={{ opacity: 0.7 }}>({pSuffix.length}/2)</span>
        </button>
      </div>

      {/* Keyboard */}
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

      <button style={{ ...st.nextBtn, ...(plateOk ? {} : { opacity: 0.35 }) }}
        disabled={!plateOk} onClick={onNext}>
        Ďalej →
      </button>
    </div>
  );
}

/* ── Duration step ───────────────────────────────────────────── */
function DurationStep({ payment, setPayment, zone, onNext, onBack }: {
  payment: Payment; setPayment: React.Dispatch<React.SetStateAction<Payment>>;
  zone: ParkingZone | null; onNext: () => void; onBack: () => void;
}) {
  const color = zone?.color ?? '#2563eb';
  return (
    <div style={st.wrap}>
      <StepHeader step={2} label="Zvoľte dobu parkovania" onBack={onBack} />
      <div style={dur.grid}>
        {DURATION_OPTS.map(opt => {
          const price = calcPrice(payment.zone, payment.lot, opt.minutes);
          const active = payment.durationMinutes === opt.minutes;
          return (
            <button key={opt.minutes}
              style={{ ...dur.btn, ...(active ? { background: color, borderColor: color, color: '#fff', transform: 'scale(1.04)' } : {}) }}
              onClick={() => setPayment(p => ({ ...p, durationMinutes: opt.minutes }))}>
              <div style={{ fontSize: 25, fontWeight: 900, lineHeight: 1 }}>{opt.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6, opacity: active ? 1 : 0.8 }}>€{price.toFixed(2)}</div>
              {zone?.freeMinutes && opt.minutes <= zone.freeMinutes
                ? <div style={{ fontSize: 13, color: active ? 'rgba(255,255,255,0.8)' : '#16a34a', fontWeight: 600, marginTop: 4 }}>zadarmo</div>
                : null}
            </button>
          );
        })}
      </div>
      <button style={st.nextBtn} onClick={onNext}>Pokračovať →</button>
    </div>
  );
}

/* ── Summary step ────────────────────────────────────────────── */
function SummaryStep({ payment, pRegion, pDigits, pSuffix, zone, onConfirm, onBack }: {
  payment: Payment; pRegion: string; pDigits: string; pSuffix: string;
  zone: ParkingZone | null; onConfirm: () => void; onBack: () => void;
}) {
  const plate = `${pRegion} ${pDigits} ${pSuffix}`;
  const price = calcPrice(payment.zone, payment.lot, payment.durationMinutes);
  const durOpt = DURATION_OPTS.find(o => o.minutes === payment.durationMinutes);
  const color = zone?.color ?? '#2563eb';
  return (
    <div style={st.wrap}>
      <StepHeader step={3} label="Súhrn platby" onBack={onBack} />
      <div style={sum.card}>
        <SumRow label="🅿️ Lokalita" val={(payment.lot?.name ?? zone?.name) ?? '–'} />
        <SumRow label="🚗 ŠPZ" val={plate} mono />
        <SumRow label="⏱️ Doba" val={durOpt?.label ?? '–'} />
        <SumRow label="💶 Sadzba" val={`€${(payment.lot?.pricePerHour ?? zone?.pricePerHour ?? 0).toFixed(2)}/hod`} />
        {(zone?.freeMinutes ?? 0) > 0 && <SumRow label="🎁 Zadarmo" val={`${zone!.freeMinutes} min`} green />}
        <div style={{ borderTop: '2px solid #e2e8f0', marginTop: 8, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>💳 Spolu</span>
          <span style={{ fontSize: 36, fontWeight: 900, color }}>€{price.toFixed(2)}</span>
        </div>
      </div>
      <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 10 }}>
        Demo kiosk – platba je simulovaná, nie je účtovaná skutočná suma.
      </div>
      <button style={{ ...st.nextBtn, background: color, fontSize: 22, padding: '18px 0' }} onClick={onConfirm}>
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
        <div style={{ fontSize: 28, fontWeight: 900, color: '#16a34a', marginTop: 8 }}>Platba úspešná!</div>
        <div style={{ fontSize: 16, color: '#64748b', marginTop: 4 }}>Vaše parkovanie je zaregistrované v systéme BPK.</div>
      </div>
      <div style={{ ...sum.card, borderColor: '#bbf7d0', background: '#f0fdf4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1.5px solid #bbf7d0' }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Kód potvrdenia</span>
          <span style={{ fontSize: 24, fontWeight: 900, fontFamily: 'monospace', color: '#16a34a', letterSpacing: 3 }}>{payment.code}</span>
        </div>
        <SumRow label="📍 Miesto" val={(payment.lot?.name ?? payment.zone?.name) ?? '–'} />
        <SumRow label="🚗 ŠPZ" val={payment.plate} mono />
        <SumRow label="💶 Zaplatené" val={`€${payment.totalPrice.toFixed(2)}`} green />
        {validUntil && (
          <div style={{ ...sum.row, marginTop: 4 }}>
            <span style={sum.label}>⏱️ Platí do</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#dc2626' }}>
              {validUntil.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>
      <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: '10px 0' }}>
        V prípade kontroly ukážte kód inšpektorovi alebo ho zapíšte na viditeľné miesto.
      </div>
      <button style={{ ...st.nextBtn, background: '#16a34a' }} onClick={onDone}>🗺️ Späť na mapu</button>
    </div>
  );
}

/* ── Shared sub-components ───────────────────────────────────── */
function StepHeader({ step, label, onBack }: { step: number; label: string; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, flexShrink: 0 }}>
      <button style={st.backSmall} onClick={onBack}>← Späť</button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Krok {step} / 3</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>{label}</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1,2,3].map(i => <div key={i} style={{ width: 32, height: 6, borderRadius: 3, background: i <= step ? '#2563eb' : '#e2e8f0' }} />)}
      </div>
    </div>
  );
}

function SumRow({ label, val, mono, green }: { label: string; val: string; mono?: boolean; green?: boolean }) {
  return (
    <div style={sum.row}>
      <span style={sum.label}>{label}</span>
      <span style={{ ...sum.val, ...(mono ? { fontFamily: 'monospace', fontSize: 18 } : {}), ...(green ? { color: '#16a34a', fontWeight: 700 } : {}) }}>{val}</span>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  container:  { display: 'flex', flexDirection: 'column', height: '100%', background: '#f0f4ff' },
  header:     { display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', flexShrink: 0 },
  backBtn:    { background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 12, padding: '10px 18px', fontSize: 19, fontWeight: 700, cursor: 'pointer', flexShrink: 0 },
  htitle:     { flex: 1, display: 'flex', alignItems: 'center', gap: 14 },
  title:      { fontSize: 27, fontWeight: 900, color: '#fff', lineHeight: 1.1 },
  sub:        { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500 },
  legendPill: { padding: '5px 12px', borderRadius: 20, color: '#fff', fontSize: 14, fontWeight: 800, border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 },
  map:        { flex: 1, minHeight: 0 },
  panel:      { flexShrink: 0, background: '#fff', borderTop: '3px solid #e2e8f0', overflow: 'hidden', transition: 'height 0.25s ease' },
};

const zl: Record<string, React.CSSProperties> = {
  wrap:   { display: 'flex', flexDirection: 'column', height: '100%', padding: '12px 20px', gap: 10 },
  hint:   { fontSize: 15, color: '#64748b', fontWeight: 600, textAlign: 'center', paddingBottom: 4 },
  hint2:  { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 'auto', paddingTop: 6 },
  cards:  { display: 'flex', gap: 14, flex: 1 },
  card:   { flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '14px 18px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 16, cursor: 'pointer', textAlign: 'left', transition: 'box-shadow 0.15s' },
  badge:  { display: 'inline-block', padding: '4px 12px', borderRadius: 20, color: '#fff', fontSize: 15, fontWeight: 800, alignSelf: 'flex-start' },
  name:   { fontSize: 16, fontWeight: 800, color: '#1e293b', lineHeight: 1.3 },
  row:    { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  price:  { fontSize: 20, fontWeight: 900 },
  free:   { fontSize: 13, background: '#dcfce7', color: '#16a34a', borderRadius: 20, padding: '2px 10px', fontWeight: 700 },
  hours:  { fontSize: 13, color: '#94a3b8', fontWeight: 500 },
};

const zd: Record<string, React.CSSProperties> = {
  wrap:    { padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 8, height: '100%' },
  backBtn: { padding: '8px 18px', borderRadius: 12, border: '2px solid #e2e8f0', background: '#f8fafc', fontWeight: 700, fontSize: 16, cursor: 'pointer', flexShrink: 0 },
  badge:   { padding: '6px 18px', borderRadius: 20, color: '#fff', fontSize: 17, fontWeight: 800 },
  meta:    { fontSize: 15, color: '#64748b', fontWeight: 500 },
  freeBadge: { background: '#dcfce7', color: '#16a34a', borderRadius: 12, padding: '8px 16px', fontSize: 16, fontWeight: 700, alignSelf: 'flex-start', marginTop: 4 },
  payBtn:  { marginTop: 'auto', padding: '18px 0', borderRadius: 16, border: 'none', color: '#fff', fontSize: 22, fontWeight: 900, cursor: 'pointer', width: '100%', letterSpacing: 0.5 },
};

const st: Record<string, React.CSSProperties> = {
  wrap:      { display: 'flex', flexDirection: 'column', height: '100%', padding: '14px 20px 12px', gap: 0 },
  backSmall: { padding: '8px 16px', borderRadius: 12, border: '2px solid #e2e8f0', background: '#f8fafc', fontWeight: 700, fontSize: 16, cursor: 'pointer', flexShrink: 0 },
  previewWrap: { display: 'flex', justifyContent: 'center', marginBottom: 12, flexShrink: 0 },
  plate:     { display: 'flex', alignItems: 'center', background: '#fff', border: '3px solid #1e293b', borderRadius: 10, overflow: 'hidden', height: 90, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' },
  plateFlag: { background: '#1e40af', color: '#fff', width: 72, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, flexShrink: 0 },
  plateNum:  { fontSize: 40, fontWeight: 900, letterSpacing: 4, padding: '0 28px', fontFamily: '"FE-Schrift", "Arial Black", sans-serif', color: '#1e293b' },
  regionRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexShrink: 0 },
  fieldLabel:{ fontSize: 15, fontWeight: 700, color: '#475569', flexShrink: 0 },
  regionScroll: { display: 'flex', gap: 6, overflowX: 'auto', flex: 1, paddingBottom: 4 },
  regBtn:    { padding: '7px 14px', borderRadius: 12, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: 15, fontWeight: 700, cursor: 'pointer', flexShrink: 0 },
  regBtnActive: { background: '#2563eb', borderColor: '#2563eb', color: '#fff' },
  tab:       { flex: 1, padding: '10px 0', borderRadius: 12, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: 17, fontWeight: 700, cursor: 'pointer' },
  tabActive: { background: '#2563eb', borderColor: '#2563eb', color: '#fff' },
  numpad:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12, flexShrink: 0 },
  alphapad:  { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 12, flexShrink: 0 },
  key:       { padding: '14px 0', borderRadius: 12, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: 24, fontWeight: 800, cursor: 'pointer', textAlign: 'center' as const },
  keyAlpha:  { padding: '10px 0', borderRadius: 10, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: 19, fontWeight: 700, cursor: 'pointer', textAlign: 'center' as const },
  keyDel:    { background: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626' },
  nextBtn:   { padding: '16px 0', borderRadius: 16, border: 'none', background: '#2563eb', color: '#fff', fontSize: 20, fontWeight: 900, cursor: 'pointer', width: '100%', marginTop: 'auto', flexShrink: 0 },
};

const dur: Record<string, React.CSSProperties> = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, flex: 1, marginBottom: 12 },
  btn:  { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 8px', borderRadius: 16, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', cursor: 'pointer', transition: 'all 0.15s' },
};

const sum: Record<string, React.CSSProperties> = {
  card:  { background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 16, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 },
  row:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 16, color: '#64748b', fontWeight: 600 },
  val:   { fontSize: 18, fontWeight: 700, color: '#1e293b' },
};
