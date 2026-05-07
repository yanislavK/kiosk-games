interface Props {
  color?: string;
  opacity?: number;
  flip?: boolean;
}

export default function SkylineIllustration({ color = '#cbd5e1', opacity = 0.5, flip = false }: Props) {
  return (
    <svg
      viewBox="0 0 1080 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        transform: flip ? 'scaleY(-1)' : undefined,
        opacity,
      }}
      preserveAspectRatio="none"
    >
      {/* Hills */}
      <ellipse cx="100" cy="130" rx="160" ry="80" fill={color} />
      <ellipse cx="300" cy="140" rx="200" ry="70" fill={color} />
      <ellipse cx="800" cy="135" rx="220" ry="75" fill={color} />
      <ellipse cx="1000" cy="130" rx="150" ry="85" fill={color} />

      {/* Buildings left cluster */}
      <rect x="40" y="60" width="28" height="65" rx="3" fill={color} />
      <rect x="72" y="40" width="36" height="85" rx="3" fill={color} />
      <rect x="112" y="55" width="24" height="70" rx="3" fill={color} />
      <rect x="140" y="30" width="20" height="95" rx="3" fill={color} />
      {/* Church spire left */}
      <rect x="165" y="50" width="22" height="75" rx="2" fill={color} />
      <polygon points="176,10 158,55 194,55" fill={color} />

      {/* Buildings center-left */}
      <rect x="250" y="65" width="30" height="60" rx="3" fill={color} />
      <rect x="284" y="45" width="40" height="80" rx="3" fill={color} />
      <rect x="328" y="55" width="26" height="70" rx="3" fill={color} />
      {/* Tower center */}
      <rect x="360" y="35" width="18" height="90" rx="3" fill={color} />
      <rect x="355" y="20" width="28" height="20" rx="2" fill={color} />
      <polygon points="369,0 355,22 383,22" fill={color} />

      {/* Center buildings */}
      <rect x="430" y="50" width="34" height="75" rx="3" fill={color} />
      <rect x="468" y="35" width="44" height="90" rx="3" fill={color} />
      <rect x="516" y="55" width="28" height="70" rx="3" fill={color} />
      <rect x="548" y="42" width="32" height="83" rx="3" fill={color} />
      {/* Castle */}
      <rect x="590" y="30" width="60" height="95" rx="4" fill={color} />
      <rect x="588" y="25" width="14" height="25" rx="2" fill={color} />
      <rect x="636" y="25" width="14" height="25" rx="2" fill={color} />
      <polygon points="620,5 608,28 632,28" fill={color} />

      {/* Buildings center-right */}
      <rect x="680" y="60" width="28" height="65" rx="3" fill={color} />
      <rect x="712" y="40" width="38" height="85" rx="3" fill={color} />
      <rect x="754" y="52" width="24" height="73" rx="3" fill={color} />

      {/* Church right */}
      <rect x="790" y="48" width="26" height="77" rx="2" fill={color} />
      <polygon points="803,12 786,52 820,52" fill={color} />

      {/* Buildings right cluster */}
      <rect x="840" y="58" width="30" height="67" rx="3" fill={color} />
      <rect x="874" y="42" width="36" height="83" rx="3" fill={color} />
      <rect x="914" y="55" width="26" height="70" rx="3" fill={color} />
      <rect x="944" y="38" width="32" height="87" rx="3" fill={color} />
      <rect x="980" y="50" width="28" height="75" rx="3" fill={color} />
      <rect x="1012" y="62" width="24" height="63" rx="3" fill={color} />
      <rect x="1040" y="45" width="30" height="80" rx="3" fill={color} />

      {/* Trees */}
      <circle cx="220" cy="80" r="18" fill={color} />
      <rect x="217" y="90" width="6" height="35" fill={color} />
      <circle cx="408" cy="85" r="15" fill={color} />
      <rect x="405" y="94" width="5" height="30" fill={color} />
      <circle cx="670" cy="82" r="16" fill={color} />
      <rect x="667" y="92" width="6" height="33" fill={color} />
      <circle cx="870" cy="80" r="18" fill={color} />
      <rect x="867" y="90" width="6" height="35" fill={color} />

      {/* Birds (simple V shapes) */}
      <path d="M 200 25 Q 207 18 214 25" stroke={color} strokeWidth="2.5" fill="none" />
      <path d="M 500 15 Q 508 8 516 15" stroke={color} strokeWidth="2.5" fill="none" />
      <path d="M 520 28 Q 527 22 534 28" stroke={color} strokeWidth="2" fill="none" />
      <path d="M 750 20 Q 758 13 766 20" stroke={color} strokeWidth="2.5" fill="none" />
      <path d="M 900 10 Q 907 4 914 10" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}
