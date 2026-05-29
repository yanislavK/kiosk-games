export type LandmarkCategory = 'hrad' | 'kostol' | 'museum' | 'park' | 'most' | 'namestie' | 'divadlo' | 'palac';

export interface Landmark {
  id: string;
  name: string;
  nameEn: string;
  category: LandmarkCategory;
  lat: number;
  lng: number;
  description: string;
  address: string;
  built?: string;
  icon: string;
  color: string;
}

export const CATEGORY_LABELS: Record<LandmarkCategory, string> = {
  hrad: 'Hrad / Zámok',
  kostol: 'Kostol / Katedrála',
  museum: 'Múzeum / Galéria',
  park: 'Park / Záhrada',
  most: 'Most / Pamätník',
  namestie: 'Námestie',
  divadlo: 'Divadlo / Kultúra',
  palac: 'Palác / Radnica',
};

export const CATEGORY_COLORS: Record<LandmarkCategory, string> = {
  hrad: '#dc2626',
  kostol: '#7c3aed',
  museum: '#0369a1',
  park: '#16a34a',
  most: '#ea580c',
  namestie: '#0891b2',
  divadlo: '#be185d',
  palac: '#92400e',
};

export const LANDMARKS: Landmark[] = [
  {
    id: 'bratislavsky-hrad',
    name: 'Bratislavský hrad',
    nameEn: 'Bratislava Castle',
    category: 'hrad',
    lat: 48.1426,
    lng: 17.1005,
    description:
      'Bratislavský hrad je dominantou slovenského hlavného mesta a symbolom Bratislavy. Hrad stojí na skalnatom brale nad Dunajom a v minulosti slúžil ako kráľovské sídlo uhorských panovníkov. Dnes je sídlom Národnej rady SR a múzeom Slovenského národného múzea. Z hradu je nádherný výhľad na celé mesto, Dunaj a okolitú krajinu.',
    address: 'Zámocká, 811 06 Bratislava',
    built: '9. storočie (súčasná podoba 15.–18. stor.)',
    icon: '🏰',
    color: '#dc2626',
  },
  {
    id: 'dom-sv-martina',
    name: 'Dóm sv. Martina',
    nameEn: "St. Martin's Cathedral",
    category: 'kostol',
    lat: 48.1420,
    lng: 17.1049,
    description:
      'Dóm sv. Martina je hlavný gotický chrám Bratislavy a najväčší kostol v meste. Od roku 1563 do roku 1830 bol korunovačným kostolom uhorských kráľov – celkovo tu bolo korunovaných 11 kráľov a 7 kráľovských manželiek. Na veži nesie pozlátenu korunu – repliku uhorskej koruny.',
    address: 'Rudnayovo nám. 1, 811 01 Bratislava',
    built: '14. – 15. storočie',
    icon: '⛪',
    color: '#7c3aed',
  },
  {
    id: 'modry-kostol',
    name: 'Modrý kostolík (sv. Alžbety)',
    nameEn: "Blue Church (St. Elizabeth's)",
    category: 'kostol',
    lat: 48.1434,
    lng: 17.1167,
    description:
      'Modrý kostolík je secesný rímskokatolícky kostol zasvätený sv. Alžbete Uhorskej. Postavený bol v rokoch 1908–1913 podľa návrhu architekta Ödöna Lechnera. Kostol je celý pokrytý pastelovo modrou keramikou a patrí medzi najkrajšie secesné stavby v strednej Európe.',
    address: 'Bezručova 2, 811 09 Bratislava',
    built: '1908–1913',
    icon: '💙',
    color: '#7c3aed',
  },
  {
    id: 'stara-radnica',
    name: 'Stará radnica',
    nameEn: 'Old Town Hall',
    category: 'palac',
    lat: 48.1438,
    lng: 17.1088,
    description:
      'Stará radnica je jednou z najstarších zachovaných svetských stavieb v Bratislave. Komplex budov z rôznych epoch (gotika, renesancia, baroko) bol centrom mestskej správy. Dnes tu sídli Múzeum mesta Bratislavy. V stene budovy je ešte stále viditeľné jadro tureckej delostreleckej gule z roku 1809.',
    address: 'Primaciálne nám. 3, 814 99 Bratislava',
    built: '14. storočie',
    icon: '🏛️',
    color: '#92400e',
  },
  {
    id: 'primacialne-namestie',
    name: 'Primaciálny palác',
    nameEn: "Primate's Palace",
    category: 'palac',
    lat: 48.1437,
    lng: 17.1093,
    description:
      'Primaciálny palác je neoklaský palác postavený v rokoch 1778–1781 pre arcibiskupa Jozefa Batthyányho. Patrí medzi najkrajšie klasicistické paláce v strednej Európe. V roku 1805 tu Napoleon Bonaparte a rakúsky cisár František II. podpísali Bratislavský mier. V paláci sa nachádza unikátna zbierka flámskych tapisérií.',
    address: 'Primaciálne nám. 1, 814 99 Bratislava',
    built: '1778–1781',
    icon: '🏛️',
    color: '#92400e',
  },
  {
    id: 'namestie-snp',
    name: 'Námestie SNP',
    nameEn: 'SNP Square',
    category: 'namestie',
    lat: 48.1451,
    lng: 17.1119,
    description:
      'Námestie SNP (Slovenského národného povstania) je hlavné námestie Bratislavy a pulzujúce centrum mesta. V strede námestia stojí Pamätník SNP – fontána s bronzovými plastikami. Na námestí sa konajú najdôležitejšie mestské podujatia, trhy a zhromaždenia. Je obklopené historickými budovami, kaviarňami a obchodmi.',
    address: 'Námestie SNP, 811 01 Bratislava',
    built: 'Historické jadro mesta',
    icon: '🏙️',
    color: '#0891b2',
  },
  {
    id: 'michaelska-brana',
    name: 'Michalská brána',
    nameEn: "Michael's Gate",
    category: 'hrad',
    lat: 48.1452,
    lng: 17.1067,
    description:
      'Michalská brána je jediná zachovaná mestská brána z pôvodného stredovekého opevnenia Bratislavy. Postavená bola v 14. storočí a prešla viacerými prestavbami. Veža je vysoká 51 metrov a na jej vrchole je socha archanjela Michala zabíjajúceho draka. V bráne sa nachádza expozícia zbraní a ukážka mestského opevnenia.',
    address: 'Michalská, 811 01 Bratislava',
    built: '14. storočie (veža 1758)',
    icon: '🗼',
    color: '#dc2626',
  },
  {
    id: 'most-snp',
    name: 'Most SNP (UFO)',
    nameEn: 'SNP Bridge (UFO)',
    category: 'most',
    lat: 48.1383,
    lng: 17.1046,
    description:
      'Most SNP je zavesený cestný most cez Dunaj, jeden z najdlhších zavesených mostov s jedným pilónom na svete. Na vrchole 85-metrovej veže sa nachádza vyhliadková plošina a reštaurácia UFO, odkiaľ je panoramatický výhľad na Bratislavu a okolie. Most bol otvorený v roku 1972.',
    address: 'Most SNP, Bratislava',
    built: '1967–1972',
    icon: '🌉',
    color: '#ea580c',
  },
  {
    id: 'slovenske-narodne-divadlo',
    name: 'Slovenské národné divadlo',
    nameEn: 'Slovak National Theatre',
    category: 'divadlo',
    lat: 48.1436,
    lng: 17.1095,
    description:
      'Slovenské národné divadlo je najstaršie profesionálne divadlo na Slovensku. Pôvodná historická budova z roku 1886 (Historická budova SND) sa nachádza na Hviezdoslavovom námestí. Nová budova SND, otvorená v roku 2007, je moderná stavba pri nábřeží Dunaja. Divadlo ponúka operu, balet a drámu.',
    address: 'Pribinova 17, 819 01 Bratislava',
    built: 'Hist. budova 1886, Nová 2007',
    icon: '🎭',
    color: '#be185d',
  },
  {
    id: 'hviezdoslavovo-namestie',
    name: 'Hviezdoslavovo námestie',
    nameEn: 'Hviezdoslav Square',
    category: 'namestie',
    lat: 48.1416,
    lng: 17.1086,
    description:
      'Hviezdoslavovo námestie je reprezentačné námestie v historickom centre Bratislavy. Lemuje ho Historická budova SND, Hotel Carlton a množstvo kaviarní a reštaurácií. V strede stojí pomník básnika Pavla Országha Hviezdoslava. Námestie je obľúbeným miestom odpočinku a kultúrnych podujatí.',
    address: 'Hviezdoslavovo nám., 811 02 Bratislava',
    built: '19. storočie',
    icon: '🌳',
    color: '#0891b2',
  },
  {
    id: 'slovenske-narodne-muzeum',
    name: 'Slovenské národné múzeum',
    nameEn: 'Slovak National Museum',
    category: 'museum',
    lat: 48.1403,
    lng: 17.1131,
    description:
      'Slovenské národné múzeum je najstaršia a najväčšia múzejná inštitúcia na Slovensku. Budova pri nábřeží Dunaja bola postavená v roku 1928. Múzeum spravuje zbierky z oblasti prírodných vied, histórie, archeológie a etnografie. Nachádza sa tu aj slávna výstava dinosaurov a prehistorických nálezov zo Slovenska.',
    address: 'Vajanského nábr. 2, 810 06 Bratislava',
    built: '1928',
    icon: '🏛️',
    color: '#0369a1',
  },
  {
    id: 'prezidentsky-palac',
    name: 'Prezidentský palác',
    nameEn: 'Presidential Palace',
    category: 'palac',
    lat: 48.1460,
    lng: 17.1100,
    description:
      'Prezidentský palác (Grassalkovichov palác) je barokový palác postavený okolo roku 1760 pre grófa Antala Grassalkoviča. Palác slúžil ako sídlo Márie Terézie počas jej pobytov v Bratislave. Dnes je officiálnym sídlom prezidenta Slovenskej republiky. Pred palácom je rozsiahla záhrada prístupná verejnosti.',
    address: 'Hodžovo nám. 1, 810 00 Bratislava',
    built: 'okolo 1760',
    icon: '🏛️',
    color: '#92400e',
  },
  {
    id: 'sad-janka-krala',
    name: 'Sad Janka Kráľa',
    nameEn: "Janko Kráľ's Garden",
    category: 'park',
    lat: 48.1343,
    lng: 17.1106,
    description:
      'Sad Janka Kráľa na Petržalke je najstarší verejný park v strednej Európe, otvorený v roku 1776. Park leží na petržalskom brehu Dunaja a je pomenovaný po slovenskom básnikovi Jankovi Kráľovi. Nachádza sa tu fontána, detské ihriská, tenisové kurty a amfiteáter. Je obľúbeným miestom prechádzok Bratislavčanov.',
    address: 'Petržalka, 851 01 Bratislava',
    built: '1776',
    icon: '🌿',
    color: '#16a34a',
  },
  {
    id: 'hrad-devin',
    name: 'Hrad Devín',
    nameEn: 'Devín Castle',
    category: 'hrad',
    lat: 48.1731,
    lng: 16.9804,
    description:
      'Zrúcanina hradu Devín sa nachádza na skalnom výbežku nad sútokom Dunaja a Moravy, na štátnej hranici s Rakúskom. Hrad bol dôležitou pevnosťou Veľkomoravskej ríše v 9. storočí. Napoleon dal hrad v roku 1809 vyhodiť do vzduchu. Dnes je národnou kultúrnou pamiatkou a obľúbenou turistickou destináciou s výhľadom do troch krajín.',
    address: 'Muránska, 841 10 Devín, Bratislava',
    built: '9. storočie (zrúcanina)',
    icon: '🏰',
    color: '#dc2626',
  },
  {
    id: 'slavin',
    name: 'Slavín – vojenský cintorín',
    nameEn: 'Slavín War Memorial',
    category: 'most',
    lat: 48.1539,
    lng: 17.0996,
    description:
      'Slavín je vojenský cintorín a pamätník, kde sú pochovaní sovietski vojaci padlí počas oslobodenia Bratislavy v apríli 1945. Dominantou je 39-metrový obelisk korunovaný sochou vojaka. Z vyhliadkovej terasy cintorína je jeden z najkrajších výhľadov na Bratislavu a okolie. Cintorín je pietnym miestom a zároveň parkom.',
    address: 'Misíkova, 811 01 Bratislava',
    built: '1960',
    icon: '🕊️',
    color: '#ea580c',
  },
];
