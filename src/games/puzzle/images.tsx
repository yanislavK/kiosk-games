import React from 'react';

export interface PuzzleImage {
  id: string;
  label: string;
  color: string;
  Component: React.FC<{ size: number }>;
}

/* ─── IMAGE 1 : Bratislavský hrad ─── */
function HradSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="h-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A90C8" /><stop offset="100%" stopColor="#B8DFF5" />
        </linearGradient>
        <linearGradient id="h-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6AAB4A" /><stop offset="100%" stopColor="#3D7A24" />
        </linearGradient>
        <linearGradient id="h-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A80C8" /><stop offset="100%" stopColor="#2A5A9A" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="800" height="800" fill="url(#h-sky)" />
      {/* Clouds */}
      <ellipse cx="160" cy="90" rx="75" ry="28" fill="rgba(255,255,255,0.85)" />
      <ellipse cx="210" cy="78" rx="55" ry="22" fill="rgba(255,255,255,0.9)" />
      <ellipse cx="115" cy="86" rx="42" ry="18" fill="rgba(255,255,255,0.75)" />
      <ellipse cx="610" cy="110" rx="80" ry="30" fill="rgba(255,255,255,0.8)" />
      <ellipse cx="660" cy="98" rx="58" ry="24" fill="rgba(255,255,255,0.85)" />
      <ellipse cx="565" cy="105" rx="46" ry="20" fill="rgba(255,255,255,0.7)" />
      {/* Background hills */}
      <ellipse cx="100" cy="560" rx="180" ry="110" fill="#8BC46A" />
      <ellipse cx="720" cy="545" rx="200" ry="120" fill="#7AB45A" />
      {/* Main hill */}
      <ellipse cx="400" cy="600" rx="400" ry="180" fill="url(#h-hill)" />
      {/* Castle shadow base */}
      <ellipse cx="400" cy="430" rx="200" ry="30" fill="rgba(0,0,0,0.18)" />
      {/* Castle main body */}
      <rect x="250" y="300" width="300" height="240" rx="4" fill="#E2D5B0" />
      <rect x="250" y="300" width="18" height="240" fill="rgba(0,0,0,0.07)" />
      <rect x="532" y="300" width="18" height="240" fill="rgba(0,0,0,0.12)" />
      {/* Left tower */}
      <rect x="218" y="252" width="52" height="145" rx="3" fill="#D5C89A" />
      <rect x="212" y="234" width="64" height="26" rx="2" fill="#C5B88A" />
      {['212','228','244','260','274'].map((x, i) => <rect key={i} x={x} y="220" width="11" height="16" rx="2" fill="#C5B88A" />)}
      {/* Right tower */}
      <rect x="530" y="252" width="52" height="145" rx="3" fill="#C8BA90" />
      <rect x="524" y="234" width="64" height="26" rx="2" fill="#B8AA80" />
      {['524','540','556','572','586'].map((x, i) => <rect key={i} x={x} y="220" width="11" height="16" rx="2" fill="#B8AA80" />)}
      {/* Centre tower */}
      <rect x="358" y="198" width="84" height="140" rx="3" fill="#D8CC98" />
      <rect x="352" y="180" width="96" height="26" rx="2" fill="#C8BC88" />
      {['352','367','382','397','412','427','436'].map((x, i) => <rect key={i} x={x} y="166" width="12" height="16" rx="2" fill="#C8BC88" />)}
      {/* Flag */}
      <line x1="400" y1="166" x2="400" y2="128" stroke="#9A9A9A" strokeWidth="3" />
      <polygon points="400,128 434,142 400,156" fill="#D32F2F" />
      {/* Windows main */}
      {[285, 350, 420, 485].map((x, i) => <rect key={i} x={x} y="348" width="36" height="48" rx="9" fill="#7AAED8" />)}
      {/* Windows centre tower */}
      <rect x="375" y="216" width="22" height="34" rx="7" fill="#7AAED8" />
      <rect x="403" y="216" width="22" height="34" rx="7" fill="#6A9EC8" />
      {/* Gate */}
      <rect x="366" y="450" width="68" height="90" rx="34" fill="#5A4828" />
      <rect x="372" y="456" width="56" height="82" rx="28" fill="#2A1C08" />
      {/* Hill grass detail */}
      <ellipse cx="400" cy="590" rx="320" ry="70" fill="#5A8A3C" />
      {/* Trees */}
      {[[220,500,30,38],[580,490,28,36],[155,535,22,28],[645,525,26,32]].map(([cx,cy,rx,ry],i)=>(
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#2A6A1A" />
          <rect x={cx-4} y={cy+ry-4} width="8" height="22" fill="#5A3A1A" />
        </g>
      ))}
      {/* River Danube */}
      <rect x="0" y="700" width="800" height="100" fill="url(#h-river)" />
      <ellipse cx="200" cy="725" rx="90" ry="7" fill="rgba(255,255,255,0.18)" />
      <ellipse cx="520" cy="740" rx="110" ry="7" fill="rgba(255,255,255,0.14)" />
      <ellipse cx="710" cy="720" rx="65" ry="6" fill="rgba(255,255,255,0.18)" />
      {/* City buildings by river */}
      {[[32,618,44,80],[82,602,54,96],[142,625,38,73],[584,612,46,86],[638,598,50,100],[696,618,42,80]].map(([x,y,w,h],i)=>(
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} rx="3" fill={['#D4A868','#C89848','#D8B068','#C89838','#D4A848','#C89040'][i]} />
          <polygon points={`${x},${y} ${x+w/2},${y-22} ${x+w},${y}`} fill={['#B85030','#C05840','#B04828','#B84530','#C05040','#A84028'][i]} />
        </g>
      ))}
    </svg>
  );
}

/* ─── IMAGE 2 : Most SNP (UFO Bridge) ─── */
function MostSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="m-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A2A6C" /><stop offset="40%" stopColor="#2E4A9C" />
          <stop offset="75%" stopColor="#C05820" /><stop offset="100%" stopColor="#E8823A" />
        </linearGradient>
        <linearGradient id="m-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A3070" /><stop offset="100%" stopColor="#0A1840" />
        </linearGradient>
        <radialGradient id="m-moon" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#FFF8DC" /><stop offset="100%" stopColor="#FFD060" />
        </radialGradient>
        <radialGradient id="m-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(255,210,80,0.4)" /><stop offset="100%" stopColor="rgba(255,210,80,0)" />
        </radialGradient>
      </defs>
      {/* Sky */}
      <rect width="800" height="800" fill="url(#m-sky)" />
      {/* Stars */}
      {[[80,60],[150,40],[230,80],[320,35],[490,55],[570,30],[660,70],[720,45],[760,85],
        [100,150],[200,130],[400,120],[600,140],[700,110]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r={i%3===0?2.5:1.5} fill="rgba(255,255,255,0.8)" />
      ))}
      {/* Moon glow */}
      <ellipse cx="680" cy="120" rx="70" ry="70" fill="url(#m-glow)" />
      {/* Moon */}
      <circle cx="680" cy="120" r="38" fill="url(#m-moon)" />
      <circle cx="695" cy="108" r="30" fill="#C08020" opacity="0.15" />
      {/* City silhouette (background) */}
      {[[0,580,60,120],[65,565,80,135],[150,575,45,125],[200,555,90,145],[295,570,50,130],
        [600,560,70,140],[675,572,55,128],[735,560,65,140]].map(([x,y,w,h],i)=>(
        <rect key={i} x={x} y={y} width={w} height={h} fill="rgba(10,18,60,0.85)" />
      ))}
      {/* City lights (windows) */}
      {[[15,590],[30,605],[90,570],[110,590],[165,580],[215,560],[225,580],[310,575],
        [620,565],[640,582],[690,577],[748,565],[760,582]].map(([x,y],i)=>(
        <rect key={i} x={x} y={y} width="8" height="6" rx="1" fill={i%2===0?"#FFD060":"#FFA020"} opacity="0.9" />
      ))}
      {/* Bridge road deck */}
      <rect x="0" y="490" width="800" height="28" rx="4" fill="#3A3A3A" />
      <rect x="0" y="494" width="800" height="4" fill="#4A4A4A" />
      {/* Road markings */}
      {[0,1,2,3,4,5,6,7].map(i => <rect key={i} x={80+i*90} y="500" width="45" height="7" rx="2" fill="rgba(255,255,255,0.4)" />)}
      {/* Main pylon */}
      <polygon points="440,70 460,70 475,520 425,520" fill="#8A8A8A" />
      <polygon points="440,70 460,70 475,520 425,520" fill="url(#m-sky)" opacity="0.3" />
      <rect x="430" y="62" width="40" height="20" rx="3" fill="#6A6A6A" />
      <rect x="436" y="44" width="28" height="22" rx="3" fill="#5A5A5A" />
      {/* UFO disc */}
      <ellipse cx="450" cy="120" rx="90" ry="22" fill="#C0C0C0" />
      <ellipse cx="450" cy="108" rx="70" ry="16" fill="#D8D8D8" />
      <ellipse cx="450" cy="102" rx="50" ry="10" fill="#E8E8E8" />
      {/* UFO windows (ring of lights) */}
      {[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>{
        const a = (i/12)*2*Math.PI;
        return <circle key={i} cx={450+62*Math.cos(a)} cy={118+14*Math.sin(a)} r="5" fill={i%3===0?"#FFD060":"#FFA020"} />;
      })}
      {/* UFO antenna */}
      <line x1="450" y1="102" x2="450" y2="70" stroke="#9A9A9A" strokeWidth="4" />
      <circle cx="450" cy="68" r="6" fill="#FFD060" />
      {/* Stay cables - left side */}
      {[80,140,200,260,320,380].map((x,i)=>(
        <line key={i} x1="442" y1="200" x2={x} y2="490" stroke="#9A9A9A" strokeWidth={i<3?2:1.5} opacity="0.7" />
      ))}
      {/* Stay cables - right side */}
      {[520,560,600,650,700,760].map((x,i)=>(
        <line key={i} x1="458" y1="200" x2={x} y2="490" stroke="#9A9A9A" strokeWidth={i<3?2:1.5} opacity="0.7" />
      ))}
      {/* Pylon base */}
      <rect x="432" y="518" width="36" height="30" rx="3" fill="#6A6A6A" />
      {/* River */}
      <rect x="0" y="570" width="800" height="230" fill="url(#m-river)" />
      {/* River reflections */}
      <polygon points="442,200 458,200 490,600 410,600" fill="rgba(150,150,150,0.15)" />
      <ellipse cx="450" cy="650" rx="80" ry="12" fill="rgba(200,180,60,0.25)" />
      {[80,200,350,550,680].map((cx,i)=>(
        <ellipse key={i} cx={cx} cy={590+i*12} rx={50+i*10} ry="5" fill="rgba(255,160,30,0.12)" />
      ))}
      {/* Water sparkles */}
      {[[120,620],[300,640],[500,615],[650,635],[750,625]].map(([cx,cy],i)=>(
        <ellipse key={i} cx={cx} cy={cy} rx="30" ry="3" fill="rgba(255,255,255,0.12)" />
      ))}
    </svg>
  );
}

/* ─── IMAGE 3 : Stará radnica (Old Town Hall) ─── */
function RadnicaSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="r-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD580" /><stop offset="50%" stopColor="#FFA040" />
          <stop offset="100%" stopColor="#FF7040" />
        </linearGradient>
        <linearGradient id="r-tower" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C8A040" /><stop offset="60%" stopColor="#E8C060" />
          <stop offset="100%" stopColor="#A88030" />
        </linearGradient>
        <linearGradient id="r-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8A040" /><stop offset="100%" stopColor="#8A6820" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="800" height="800" fill="url(#r-sky)" />
      {/* Sun */}
      <circle cx="650" cy="100" r="55" fill="#FFE060" opacity="0.9" />
      <circle cx="650" cy="100" r="42" fill="#FFF080" />
      {/* Sun rays */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>{
        const rad = a*Math.PI/180;
        return <line key={i} x1={650+50*Math.cos(rad)} y1={100+50*Math.sin(rad)}
          x2={650+75*Math.cos(rad)} y2={100+75*Math.sin(rad)}
          stroke="#FFD040" strokeWidth="3" opacity="0.6" />;
      })}
      {/* Clouds (warm pink-orange) */}
      <ellipse cx="180" cy="120" rx="85" ry="30" fill="rgba(255,200,120,0.7)" />
      <ellipse cx="230" cy="108" rx="60" ry="24" fill="rgba(255,210,140,0.75)" />
      <ellipse cx="135" cy="115" rx="48" ry="20" fill="rgba(255,190,110,0.65)" />
      {/* Side buildings (left) */}
      <rect x="0" y="380" width="160" height="420" rx="3" fill="#C89438" />
      <rect x="160" y="350" width="120" height="450" rx="3" fill="#D8A848" />
      <rect x="0" y="380" width="20" height="420" fill="rgba(0,0,0,0.12)" />
      {/* Side buildings (right) */}
      <rect x="540" y="360" width="130" height="440" rx="3" fill="#D4A040" />
      <rect x="670" y="390" width="130" height="410" rx="3" fill="#C49030" />
      <rect x="780" y="390" width="20" height="410" fill="rgba(0,0,0,0.15)" />
      {/* Gothic arches on side buildings */}
      {[20,60,100].map((x,i)=><rect key={i} x={x} y="430" width="30" height="50" rx="15" fill="#3A2808" />)}
      {[175,210].map((x,i)=><rect key={i} x={x} y="415" width="34" height="54" rx="17" fill="#3A2808" />)}
      {[555,600,640].map((x,i)=><rect key={i} x={x} y="420" width="32" height="50" rx="16" fill="#3A2808" />)}
      {/* Main tower base */}
      <rect x="290" y="280" width="220" height="520" rx="4" fill="url(#r-tower)" />
      <rect x="290" y="280" width="22" height="520" fill="rgba(0,0,0,0.10)" />
      <rect x="488" y="280" width="22" height="520" fill="rgba(0,0,0,0.15)" />
      {/* Tower clock face */}
      <circle cx="400" cy="370" r="52" fill="#F5E8C0" />
      <circle cx="400" cy="370" r="44" fill="#FFF8E0" />
      <circle cx="400" cy="370" r="5" fill="#8A6020" />
      {/* Clock hands */}
      <line x1="400" y1="370" x2="400" y2="334" stroke="#5A3A10" strokeWidth="5" strokeLinecap="round" />
      <line x1="400" y1="370" x2="428" y2="386" stroke="#5A3A10" strokeWidth="4" strokeLinecap="round" />
      {/* Clock hour marks */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>{
        const r=a*Math.PI/180,r1=38,r2=i%3===0?30:34;
        return <line key={i} x1={400+r1*Math.cos(r-Math.PI/2)} y1={370+r1*Math.sin(r-Math.PI/2)}
          x2={400+r2*Math.cos(r-Math.PI/2)} y2={370+r2*Math.sin(r-Math.PI/2)}
          stroke="#8A6020" strokeWidth={i%3===0?4:2} />;
      })}
      {/* Tower windows */}
      {[480,540,600,650].map((y,i)=>(
        <g key={i}>
          <rect x="348" y={y} width="44" height="56" rx="22" fill="#3A2808" />
          <rect x="410" y={y} width="44" height="56" rx="22" fill="#3A2808" />
          <rect x="350" y={y+2} width="40" height="52" rx="20" fill="#7AAED870" />
          <rect x="412" y={y+2} width="40" height="52" rx="20" fill="#7AAED870" />
        </g>
      ))}
      {/* Decorative cornice */}
      <rect x="278" y="272" width="244" height="18" rx="4" fill="#A87C28" />
      {/* Gothic spire top */}
      <polygon points="400,60 310,280 490,280" fill="#9A7030" />
      <polygon points="400,60 310,280 490,280" fill="rgba(255,160,0,0.18)" />
      <polygon points="400,60 350,200 450,200" fill="#B88038" />
      {/* Spire peak */}
      <line x1="400" y1="60" x2="400" y2="20" stroke="#8A6020" strokeWidth="5" />
      <polygon points="400,20 414,46 386,46" fill="#C8A040" />
      {/* Rooftop cross detail on sides */}
      <polygon points="80,380 110,350 140,380" fill="#B85030" />
      <polygon points="175,350 205,318 235,350" fill="#C06040" />
      <polygon points="555,360 585,330 615,360" fill="#B84830" />
      <polygon points="675,390 705,360 735,390" fill="#C05038" />
      {/* Ground / square */}
      <rect x="0" y="750" width="800" height="50" fill="url(#r-ground)" />
      <rect x="0" y="750" width="800" height="8" fill="#D8B050" />
      {/* Cobblestone hint */}
      {[0,1,2,3,4,5,6,7].map(i=>[0,1,2].map(j=>(
        <rect key={`${i}-${j}`} x={i*100+j*30} y={760} width="26" height="16" rx="2" fill="rgba(0,0,0,0.06)" />
      )))}
      {/* Lamp posts */}
      {[100,650].map((x,i)=>(
        <g key={i}>
          <rect x={x-3} y="680" width="6" height="75" fill="#5A4010" />
          <ellipse cx={x} cy="676" rx="18" ry="8" fill="#8A6820" />
          <circle cx={x} cy="668" r="10" fill="#FFE060" opacity="0.9" />
          <ellipse cx={x} cy="668" rx="20" ry="20" fill="rgba(255,220,60,0.2)" />
        </g>
      ))}
    </svg>
  );
}

/* ─── IMAGE 4 : Devínsky hrad (Castle ruins) ─── */
function DevinSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="d-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5BBFEA" /><stop offset="70%" stopColor="#A8D8F0" />
          <stop offset="100%" stopColor="#D0EEF8" />
        </linearGradient>
        <linearGradient id="d-cliff" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9A8060" /><stop offset="100%" stopColor="#6A5038" />
        </linearGradient>
        <linearGradient id="d-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#78B848" /><stop offset="100%" stopColor="#486828" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="800" height="800" fill="url(#d-sky)" />
      {/* Clouds */}
      <ellipse cx="200" cy="110" rx="90" ry="34" fill="rgba(255,255,255,0.88)" />
      <ellipse cx="255" cy="96" rx="65" ry="26" fill="rgba(255,255,255,0.92)" />
      <ellipse cx="148" cy="104" rx="50" ry="22" fill="rgba(255,255,255,0.78)" />
      <ellipse cx="580" cy="80" rx="70" ry="28" fill="rgba(255,255,255,0.82)" />
      <ellipse cx="628" cy="68" rx="52" ry="22" fill="rgba(255,255,255,0.86)" />
      <ellipse cx="542" cy="76" rx="42" ry="18" fill="rgba(255,255,255,0.72)" />
      {/* Background hills */}
      <ellipse cx="0" cy="650" rx="220" ry="150" fill="#8DC860" />
      <ellipse cx="800" cy="660" rx="250" ry="140" fill="#7AB850" />
      <ellipse cx="400" cy="680" rx="500" ry="130" fill="#90C862" />
      {/* Rock cliff face */}
      <polygon points="280,720 330,380 520,360 560,720" fill="url(#d-cliff)" />
      <polygon points="280,720 330,380 360,400 320,720" fill="rgba(0,0,0,0.12)" />
      <polygon points="520,360 560,720 540,720 505,370" fill="rgba(0,0,0,0.18)" />
      {/* Cliff cracks/texture */}
      <line x1="360" y1="420" x2="340" y2="520" stroke="rgba(0,0,0,0.15)" strokeWidth="3" />
      <line x1="420" y1="400" x2="400" y2="550" stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
      <line x1="480" y1="410" x2="460" y2="530" stroke="rgba(0,0,0,0.10)" strokeWidth="2" />
      {/* Castle ruins on top of cliff */}
      {/* Left ruin wall */}
      <rect x="300" y="290" width="60" height="100" rx="2" fill="#B8A478" />
      <rect x="300" y="275" width="60" height="20" rx="2" fill="#A89468" />
      {[300,318,336,352].map((x,i)=><rect key={i} x={x} y="262" width="12" height="16" rx="2" fill="#A89468" />)}
      {/* Right ruin wall */}
      <rect x="430" y="275" width="80" height="115" rx="2" fill="#A8946A" />
      <rect x="430" y="258" width="80" height="22" rx="2" fill="#988458" />
      {[430,448,466,484,500].map((x,i)=><rect key={i} x={x} y="244" width="12" height="16" rx="2" fill="#988458" />)}
      {/* Round tower ruin */}
      <rect x="380" y="250" width="48" height="130" rx="6" fill="#B8A478" />
      <rect x="372" y="232" width="64" height="24" rx="4" fill="#A89468" />
      {[372,390,408,424].map((x,i)=><rect key={i} x={x} y="218" width="12" height="16" rx="2" fill="#A89468" />)}
      {/* Missing wall section (ruin effect) */}
      <rect x="360" y="320" width="28" height="60" rx="2" fill="#9A8460" />
      {/* Windows (empty arches) */}
      <rect x="318" y="310" width="22" height="32" rx="11" fill="rgba(0,0,0,0.6)" />
      <rect x="390" y="282" width="20" height="30" rx="10" fill="rgba(0,0,0,0.6)" />
      <rect x="452" y="296" width="22" height="34" rx="11" fill="rgba(0,0,0,0.6)" />
      <rect x="490" y="316" width="20" height="30" rx="10" fill="rgba(0,0,0,0.6)" />
      {/* Vegetation on ruins */}
      <ellipse cx="310" cy="280" rx="18" ry="14" fill="#4A9A28" />
      <ellipse cx="500" cy="265" rx="16" ry="12" fill="#4A9A28" />
      <ellipse cx="395" cy="230" rx="14" ry="10" fill="#3A8A1A" />
      {/* Hill slope (green) */}
      <ellipse cx="420" cy="670" rx="500" ry="200" fill="url(#d-hill)" />
      {/* Forest trees */}
      {[[60,560,32,48],[130,545,26,40],[630,550,30,46],[710,540,28,42],[760,562,24,36]].map(([cx,cy,rx,ry],i)=>(
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#2A6A1A" />
          <rect x={cx-5} y={cy+ry-6} width="10" height="28" fill="#5A3A1A" />
          <ellipse cx={cx+8} cy={cy-6} rx={rx*0.7} ry={ry*0.6} fill="#3A7A2A" />
        </g>
      ))}
      {/* River Morava at bottom */}
      <rect x="0" y="728" width="800" height="72" fill="#4A88C8" opacity="0.85" />
      <ellipse cx="250" cy="748" rx="100" ry="7" fill="rgba(255,255,255,0.2)" />
      <ellipse cx="580" cy="758" rx="120" ry="7" fill="rgba(255,255,255,0.15)" />
      {/* Birds in sky */}
      {[[200,180],[340,150],[380,165],[500,140],[540,158]].map(([cx,cy],i)=>(
        <path key={i} d={`M${cx},${cy} Q${cx+10},${cy-8} ${cx+20},${cy}`} stroke="rgba(30,60,100,0.6)" strokeWidth="2.5" fill="none" />
      ))}
    </svg>
  );
}

export const PUZZLE_IMAGES: PuzzleImage[] = [
  { id: 'hrad',    label: 'Bratislavský hrad', color: '#7c3aed', Component: HradSvg },
  { id: 'most',    label: 'Most SNP',          color: '#1d4ed8', Component: MostSvg },
  { id: 'radnica', label: 'Stará radnica',     color: '#c2410c', Component: RadnicaSvg },
  { id: 'devin',   label: 'Devínsky hrad',     color: '#15803d', Component: DevinSvg },
];
