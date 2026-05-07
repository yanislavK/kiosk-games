const S = 180; // default viewBox size

/* Octagon path for STOP sign */
const octagon = (cx: number, cy: number, r: number) => {
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = ((i * 45 - 22.5) * Math.PI) / 180;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  });
  return pts.join(' ');
};

export function SignStop({ size = S }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180">
      <polygon points={octagon(90, 90, 80)} fill="#E53935" />
      <polygon points={octagon(90, 90, 72)} fill="none" stroke="white" strokeWidth="5" />
      <text x="90" y="102" textAnchor="middle" fontSize="38" fontWeight="900" fill="white" fontFamily="Arial,sans-serif" letterSpacing="2">STOP</text>
    </svg>
  );
}

export function SignRedLight({ size = S }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180">
      <rect x="55" y="20" width="70" height="145" rx="14" fill="#2d2d2d" />
      <rect x="60" y="25" width="60" height="130" rx="10" fill="#1a1a1a" />
      {/* Red - ON */}
      <circle cx="90" cy="58" r="22" fill="#E53935" />
      <circle cx="90" cy="58" r="18" fill="#FF5252" />
      <ellipse cx="82" cy="51" rx="6" ry="4" fill="rgba(255,255,255,0.3)" />
      {/* Yellow - OFF */}
      <circle cx="90" cy="96" r="22" fill="#333" />
      <circle cx="90" cy="96" r="18" fill="#222" />
      {/* Green - OFF */}
      <circle cx="90" cy="134" r="22" fill="#333" />
      <circle cx="90" cy="134" r="18" fill="#222" />
      {/* Pole */}
      <rect x="85" y="165" width="10" height="15" rx="3" fill="#555" />
    </svg>
  );
}

export function SignSpeed50({ size = S }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180">
      <circle cx="90" cy="90" r="82" fill="#E53935" />
      <circle cx="90" cy="90" r="74" fill="white" />
      <text x="90" y="112" textAnchor="middle" fontSize="60" fontWeight="900" fill="#1a1a1a" fontFamily="Arial,sans-serif">50</text>
    </svg>
  );
}

export function SignYield({ size = S }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180">
      {/* Inverted triangle - red border */}
      <polygon points="90,160 10,20 170,20" fill="#E53935" />
      <polygon points="90,148 22,28 158,28" fill="white" />
      <text x="90" y="106" textAnchor="middle" fontSize="13" fontWeight="700" fill="#E53935" fontFamily="Arial,sans-serif">DAJ</text>
      <text x="90" y="122" textAnchor="middle" fontSize="13" fontWeight="700" fill="#E53935" fontFamily="Arial,sans-serif">PREDNOSŤ</text>
    </svg>
  );
}

export function SignSeatbelt({ size = S }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180">
      <circle cx="90" cy="90" r="82" fill="#1565C0" />
      <circle cx="90" cy="90" r="74" fill="white" />
      {/* Person silhouette */}
      <circle cx="90" cy="52" r="16" fill="#1565C0" />
      <rect x="72" y="70" width="36" height="52" rx="8" fill="#1565C0" />
      <rect x="72" y="122" width="15" height="28" rx="4" fill="#1565C0" />
      <rect x="93" y="122" width="15" height="28" rx="4" fill="#1565C0" />
      {/* Belt strap */}
      <line x1="90" y1="72" x2="116" y2="118" stroke="#FFC107" strokeWidth="7" strokeLinecap="round" />
      <rect x="108" y="108" width="20" height="14" rx="4" fill="#FFC107" />
    </svg>
  );
}

export function SignSpeed130({ size = S }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180">
      <circle cx="90" cy="90" r="82" fill="#E53935" />
      <circle cx="90" cy="90" r="74" fill="white" />
      <text x="90" y="112" textAnchor="middle" fontSize="48" fontWeight="900" fill="#1a1a1a" fontFamily="Arial,sans-serif">130</text>
    </svg>
  );
}

export function SignPedestrian({ size = S }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180">
      <rect x="10" y="10" width="160" height="160" rx="12" fill="#1565C0" />
      <rect x="18" y="18" width="144" height="144" rx="8" fill="#1565C0" />
      {/* Walking person */}
      <circle cx="90" cy="42" r="14" fill="white" />
      <line x1="90" y1="56" x2="90" y2="110" stroke="white" strokeWidth="10" strokeLinecap="round" />
      {/* Left arm */}
      <line x1="90" y1="72" x2="62" y2="94" stroke="white" strokeWidth="9" strokeLinecap="round" />
      {/* Right arm */}
      <line x1="90" y1="72" x2="114" y2="88" stroke="white" strokeWidth="9" strokeLinecap="round" />
      {/* Left leg */}
      <line x1="90" y1="110" x2="68" y2="148" stroke="white" strokeWidth="9" strokeLinecap="round" />
      {/* Right leg */}
      <line x1="90" y1="110" x2="110" y2="148" stroke="white" strokeWidth="9" strokeLinecap="round" />
      {/* Stripes below */}
      {[0,1,2,3,4].map(i => (
        <rect key={i} x={20 + i * 30} y="160" width="20" height="10" rx="2" fill="white" opacity="0.6" />
      ))}
    </svg>
  );
}

export function SignDashedLine({ size = S }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180">
      {/* Road surface */}
      <rect width="180" height="180" rx="12" fill="#607D8B" />
      {/* Road */}
      <rect x="20" y="0" width="140" height="180" fill="#78909C" />
      {/* Lane markings */}
      <rect x="20" y="0" width="4" height="180" fill="#FFEB3B" />
      <rect x="156" y="0" width="4" height="180" fill="#FFEB3B" />
      {/* Dashed center */}
      {[0, 1, 2, 3, 4].map(i => (
        <rect key={i} x="88" y={i * 40 + 10} width="6" height="24" rx="2" fill="white" />
      ))}
      {/* Arrow showing can cross */}
      <polygon points="110,80 130,90 110,100" fill="#4CAF50" />
      <rect x="90" y="86" width="22" height="8" rx="3" fill="#4CAF50" />
    </svg>
  );
}

export function SignSpeed90({ size = S }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180">
      <circle cx="90" cy="90" r="82" fill="#E53935" />
      <circle cx="90" cy="90" r="74" fill="white" />
      <text x="90" y="112" textAnchor="middle" fontSize="56" fontWeight="900" fill="#1a1a1a" fontFamily="Arial,sans-serif">90</text>
    </svg>
  );
}

export function SignNoEntry({ size = S }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180">
      <circle cx="90" cy="90" r="82" fill="#E53935" />
      <circle cx="90" cy="90" r="74" fill="#E53935" />
      {/* White horizontal bar */}
      <rect x="24" y="72" width="132" height="36" rx="8" fill="white" />
    </svg>
  );
}

export function SignPriority({ size = S }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180">
      {/* Yellow diamond */}
      <polygon points="90,8 172,90 90,172 8,90" fill="#FFC107" />
      <polygon points="90,20 160,90 90,160 20,90" fill="white" />
      <polygon points="90,34 146,90 90,146 34,90" fill="#FFC107" />
    </svg>
  );
}
