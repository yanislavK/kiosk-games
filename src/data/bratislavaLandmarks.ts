export type LandmarkCategory =
  | 'hrad' | 'kostol' | 'museum' | 'park' | 'most' | 'namestie' | 'divadlo' | 'palac'
  | 'policia' | 'nemocnica' | 'lekaren' | 'doprava' | 'urad' | 'posta';

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
  /** Exact Wikimedia Commons thumbnail URL, verified via Wikipedia REST API */
  photo?: string;
}

export const CATEGORY_LABELS: Record<LandmarkCategory, string> = {
  hrad:      'Hrad / Zámok',
  kostol:    'Kostol / Katedrála',
  museum:    'Múzeum / Galéria',
  park:      'Park / Záhrada',
  most:      'Most / Pamätník',
  namestie:  'Námestie',
  divadlo:   'Divadlo / Kultúra',
  palac:     'Palác / Radnica',
  policia:   'Polícia',
  nemocnica: 'Nemocnica / Poliklinika',
  lekaren:   'Lekáreň',
  doprava:   'Doprava',
  urad:      'Mestský úrad',
  posta:     'Pošta',
};

export const CATEGORY_COLORS: Record<LandmarkCategory, string> = {
  hrad:      '#dc2626',
  kostol:    '#7c3aed',
  museum:    '#0369a1',
  park:      '#16a34a',
  most:      '#ea580c',
  namestie:  '#0891b2',
  divadlo:   '#be185d',
  palac:     '#92400e',
  policia:   '#1d4ed8',
  nemocnica: '#e11d48',
  lekaren:   '#15803d',
  doprava:   '#b45309',
  urad:      '#6d28d9',
  posta:     '#d97706',
};

const CDN = 'https://upload.wikimedia.org/wikipedia/commons/thumb';

export const LANDMARKS: Landmark[] = [

  /* ── Historické pamiatky ─────────────────────────────────── */
  {
    id: 'bratislavsky-hrad',
    name: 'Bratislavský hrad',
    nameEn: 'Bratislava Castle',
    category: 'hrad',
    lat: 48.1426, lng: 17.1005,
    // confirmed: en.wikipedia.org/api/rest_v1/page/summary/Bratislava_Castle
    photo: `${CDN}/b/b4/Bratislava_-_Burg_%28b%29.JPG/640px-Bratislava_-_Burg_%28b%29.JPG`,
    description: 'Bratislavský hrad je dominantou slovenského hlavného mesta a symbolom Bratislavy. Hrad stojí na skalnatom brale nad Dunajom a v minulosti slúžil ako kráľovské sídlo uhorských panovníkov. Dnes je sídlom Národnej rady SR a múzeom Slovenského národného múzea. Z hradu je nádherný výhľad na celé mesto, Dunaj a okolitú krajinu.',
    address: 'Zámocká, 811 06 Bratislava',
    built: '9. storočie (súčasná podoba 15.–18. stor.)',
    icon: '🏰', color: '#dc2626',
  },
  {
    id: 'dom-sv-martina',
    name: 'Dóm sv. Martina',
    nameEn: "St. Martin's Cathedral",
    category: 'kostol',
    lat: 48.1420, lng: 17.1049,
    // confirmed: en.wikipedia.org/api/rest_v1/page/summary/St._Martin%27s_Cathedral,_Bratislava
    // note: filename contains literal í (not %C3%AD) as returned by API
    photo: `${CDN}/1/1e/Catedral_de_San_Mart%C3%ADn%2C_Bratislava%2C_Eslovaquia%2C_2020-02-01%2C_DD_48.jpg/640px-Catedral_de_San_Mart%C3%ADn%2C_Bratislava%2C_Eslovaquia%2C_2020-02-01%2C_DD_48.jpg`,
    description: 'Dóm sv. Martina je hlavný gotický chrám Bratislavy a najväčší kostol v meste. Od roku 1563 do roku 1830 bol korunovačným kostolom uhorských kráľov – celkovo tu bolo korunovaných 11 kráľov a 7 kráľovských manželiek. Na veži nesie pozlátenu korunu – repliku uhorskej koruny.',
    address: 'Rudnayovo nám. 1, 811 01 Bratislava',
    built: '14. – 15. storočie',
    icon: '⛪', color: '#7c3aed',
  },
  {
    id: 'modry-kostol',
    name: 'Modrý kostolík (sv. Alžbety)',
    nameEn: "Blue Church (St. Elizabeth's)",
    category: 'kostol',
    lat: 48.1434, lng: 17.1167,
    description: 'Modrý kostolík je secesný rímskokatolícky kostol zasvätený sv. Alžbete Uhorskej. Postavený bol v rokoch 1908–1913 podľa návrhu architekta Ödöna Lechnera. Kostol je celý pokrytý pastelovo modrou keramikou a patrí medzi najkrajšie secesné stavby v strednej Európe.',
    address: 'Bezručova 2, 811 09 Bratislava',
    built: '1908–1913',
    icon: '💙', color: '#7c3aed',
  },
  {
    id: 'stara-radnica',
    name: 'Stará radnica',
    nameEn: 'Old Town Hall',
    category: 'palac',
    lat: 48.1438, lng: 17.1088,
    // confirmed: en.wikipedia.org/api/rest_v1/page/summary/Old_Town_Hall_(Bratislava)
    photo: `${CDN}/2/29/Bratislava14Slovakia65.JPG/640px-Bratislava14Slovakia65.JPG`,
    description: 'Stará radnica je jednou z najstarších zachovaných svetských stavieb v Bratislave. Komplex budov z rôznych epoch (gotika, renesancia, baroko) bol centrom mestskej správy. Dnes tu sídli Múzeum mesta Bratislavy. V stene budovy je ešte stále viditeľné jadro tureckej delostreleckej gule z roku 1809.',
    address: 'Primaciálne nám. 3, 814 99 Bratislava',
    built: '14. storočie',
    icon: '🏛️', color: '#92400e',
  },
  {
    id: 'primacialne-namestie',
    name: 'Primaciálny palác',
    nameEn: "Primate's Palace",
    category: 'palac',
    lat: 48.1437, lng: 17.1093,
    // confirmed: en.wikipedia.org/api/rest_v1/page/summary/Primate%27s_Palace,_Bratislava
    photo: `${CDN}/d/d2/Palacio_primacial%2C_Bratislava%2C_Eslovaquia%2C_2020-02-01%2C_DD_30.jpg/640px-Palacio_primacial%2C_Bratislava%2C_Eslovaquia%2C_2020-02-01%2C_DD_30.jpg`,
    description: 'Primaciálny palác je neoklasický palác postavený v rokoch 1778–1781 pre arcibiskupa Jozefa Batthyányho. Patrí medzi najkrajšie klasicistické paláce v strednej Európe. V roku 1805 tu Napoleon Bonaparte a rakúsky cisár František II. podpísali Bratislavský mier. V paláci sa nachádza unikátna zbierka flámskych tapisérií.',
    address: 'Primaciálne nám. 1, 814 99 Bratislava',
    built: '1778–1781',
    icon: '🏛️', color: '#92400e',
  },
  {
    id: 'namestie-snp',
    name: 'Námestie SNP',
    nameEn: 'SNP Square',
    category: 'namestie',
    lat: 48.1451, lng: 17.1119,
    description: 'Námestie SNP (Slovenského národného povstania) je hlavné námestie Bratislavy a pulzujúce centrum mesta. V strede námestia stojí Pamätník SNP – fontána s bronzovými plastikami. Na námestí sa konajú najdôležitejšie mestské podujatia, trhy a zhromaždenia. Je obklopené historickými budovami, kaviarňami a obchodmi.',
    address: 'Námestie SNP, 811 01 Bratislava',
    built: 'Historické jadro mesta',
    icon: '🏙️', color: '#0891b2',
  },
  {
    id: 'michaelska-brana',
    name: 'Michalská brána',
    nameEn: "Michael's Gate",
    category: 'hrad',
    lat: 48.1452, lng: 17.1067,
    // confirmed: sk.wikipedia.org/api/rest_v1/page/summary/Michalská_brána
    photo: `${CDN}/7/79/Ba-michalsk%C3%A1_br%C3%A1na.jpg/640px-Ba-michalsk%C3%A1_br%C3%A1na.jpg`,
    description: 'Michalská brána je jediná zachovaná mestská brána z pôvodného stredovekého opevnenia Bratislavy. Postavená bola v 14. storočí a prešla viacerými prestavbami. Veža je vysoká 51 metrov a na jej vrchole je socha archanjela Michala zabíjajúceho draka. V bráne sa nachádza expozícia zbraní a ukážka mestského opevnenia.',
    address: 'Michalská, 811 01 Bratislava',
    built: '14. storočie (veža 1758)',
    icon: '🗼', color: '#dc2626',
  },
  {
    id: 'most-snp',
    name: 'Most SNP (UFO)',
    nameEn: 'SNP Bridge (UFO)',
    category: 'most',
    lat: 48.1383, lng: 17.1046,
    // confirmed: en.wikipedia.org/api/rest_v1/page/summary/Most_SNP
    photo: `${CDN}/3/3d/Most_SNP%2C_Bratislava_%28by_Pudelek%29.JPG/640px-Most_SNP%2C_Bratislava_%28by_Pudelek%29.JPG`,
    description: 'Most SNP je zavesený cestný most cez Dunaj, jeden z najdlhších zavesených mostov s jedným pilónom na svete. Na vrchole 85-metrovej veže sa nachádza vyhliadková plošina a reštaurácia UFO, odkiaľ je panoramatický výhľad na Bratislavu a okolie. Most bol otvorený v roku 1972.',
    address: 'Most SNP, Bratislava',
    built: '1967–1972',
    icon: '🌉', color: '#ea580c',
  },
  {
    id: 'slovenske-narodne-divadlo',
    name: 'Slovenské národné divadlo',
    nameEn: 'Slovak National Theatre',
    category: 'divadlo',
    lat: 48.1436, lng: 17.1095,
    // confirmed: en.wikipedia.org/api/rest_v1/page/summary/Slovak_National_Theatre
    photo: `${CDN}/2/20/Bratislava10Slovakia117.JPG/640px-Bratislava10Slovakia117.JPG`,
    description: 'Slovenské národné divadlo je najstaršie profesionálne divadlo na Slovensku. Pôvodná historická budova z roku 1886 sa nachádza na Hviezdoslavovom námestí. Nová budova SND, otvorená v roku 2007, je moderná stavba pri nábreží Dunaja. Divadlo ponúka operu, balet a drámu.',
    address: 'Hviezdoslavovo nám. 1, 811 02 Bratislava',
    built: '1886 (hist. budova)',
    icon: '🎭', color: '#be185d',
  },
  {
    id: 'hviezdoslavovo-namestie',
    name: 'Hviezdoslavovo námestie',
    nameEn: 'Hviezdoslav Square',
    category: 'namestie',
    lat: 48.1416, lng: 17.1086,
    // confirmed: en.wikipedia.org/api/rest_v1/page/summary/Hviezdoslav_Square
    photo: `${CDN}/d/d1/Hviezdoslavovo_n%C3%A1mestie_%2810267450433%29.jpg/640px-Hviezdoslavovo_n%C3%A1mestie_%2810267450433%29.jpg`,
    description: 'Hviezdoslavovo námestie je reprezentačné námestie v historickom centre Bratislavy. Lemuje ho Historická budova SND, Hotel Carlton a množstvo kaviarní a reštaurácií. V strede stojí pomník básnika Pavla Országha Hviezdoslava. Námestie je obľúbeným miestom odpočinku a kultúrnych podujatí.',
    address: 'Hviezdoslavovo nám., 811 02 Bratislava',
    built: '19. storočie',
    icon: '🌳', color: '#0891b2',
  },
  {
    id: 'slovenske-narodne-muzeum',
    name: 'Slovenské národné múzeum',
    nameEn: 'Slovak National Museum',
    category: 'museum',
    lat: 48.1403, lng: 17.1131,
    // confirmed: sk.wikipedia.org/api/rest_v1/page/summary/Slovenské_národné_múzeum
    photo: `${CDN}/7/7c/Slovak_National_Museum_in_Bratislava_%281%29.jpg/640px-Slovak_National_Museum_in_Bratislava_%281%29.jpg`,
    description: 'Slovenské národné múzeum je najstaršia a najväčšia múzejná inštitúcia na Slovensku. Budova pri nábreží Dunaja bola postavená v roku 1928. Múzeum spravuje zbierky z oblasti prírodných vied, histórie, archeológie a etnografie. Nachádza sa tu aj slávna výstava dinosaurov a prehistorických nálezov zo Slovenska.',
    address: 'Vajanského nábr. 2, 810 06 Bratislava',
    built: '1928',
    icon: '🏛️', color: '#0369a1',
  },
  {
    id: 'prezidentsky-palac',
    name: 'Prezidentský palác',
    nameEn: 'Presidential Palace',
    category: 'palac',
    lat: 48.1460, lng: 17.1100,
    // confirmed: en.wikipedia.org/api/rest_v1/page/summary/Grassalkovich_Palace
    photo: `${CDN}/c/cd/Palacio_Grassalkovich%2C_Bratislava%2C_Eslovaquia%2C_2020-02-01%2C_DD_21.jpg/640px-Palacio_Grassalkovich%2C_Bratislava%2C_Eslovaquia%2C_2020-02-01%2C_DD_21.jpg`,
    description: 'Prezidentský palác (Grassalkovičov palác) je barokový palác postavený okolo roku 1760 pre grófa Antala Grassalkoviča. Palác slúžil ako sídlo Márie Terézie počas jej pobytov v Bratislave. Dnes je officiálnym sídlom prezidenta Slovenskej republiky. Pred palácom je rozsiahla záhrada prístupná verejnosti.',
    address: 'Hodžovo nám. 1, 810 00 Bratislava',
    built: 'okolo 1760',
    icon: '🏛️', color: '#92400e',
  },
  {
    id: 'sad-janka-krala',
    name: 'Sad Janka Kráľa',
    nameEn: "Janko Kráľ's Garden",
    category: 'park',
    lat: 48.1343, lng: 17.1106,
    // confirmed: sk.wikipedia.org/api/rest_v1/page/summary/Sad_Janka_Kráľa
    photo: `${CDN}/7/74/Sad_Janka_Krala%2C_Bratislava%2C_Slovakia.JPG/640px-Sad_Janka_Krala%2C_Bratislava%2C_Slovakia.JPG`,
    description: 'Sad Janka Kráľa na Petržalke je najstarší verejný park v strednej Európe, otvorený v roku 1776. Park leží na petržalskom brehu Dunaja a je pomenovaný po slovenskom básnikovi Jankovi Kráľovi. Nachádza sa tu fontána, detské ihriská, tenisové kurty a amfiteáter. Je obľúbeným miestom prechádzok Bratislavčanov.',
    address: 'Petržalka, 851 01 Bratislava',
    built: '1776',
    icon: '🌿', color: '#16a34a',
  },
  {
    id: 'hrad-devin',
    name: 'Hrad Devín',
    nameEn: 'Devín Castle',
    category: 'hrad',
    lat: 48.1731, lng: 16.9804,
    // confirmed: en.wikipedia.org/api/rest_v1/page/summary/Dev%C3%ADn_Castle
    photo: `${CDN}/1/16/Devin02.jpg/640px-Devin02.jpg`,
    description: 'Zrúcanina hradu Devín sa nachádza na skalnom výbežku nad sútokom Dunaja a Moravy, na štátnej hranici s Rakúskom. Hrad bol dôležitou pevnosťou Veľkomoravskej ríše v 9. storočí. Napoleon dal hrad v roku 1809 vyhodiť do vzduchu. Dnes je národnou kultúrnou pamiatkou a obľúbenou turistickou destináciou.',
    address: 'Muránska, 841 10 Devín, Bratislava',
    built: '9. storočie (zrúcanina)',
    icon: '🏰', color: '#dc2626',
  },
  {
    id: 'slavin',
    name: 'Slavín – vojenský cintorín',
    nameEn: 'Slavín War Memorial',
    category: 'most',
    lat: 48.1539, lng: 17.0996,
    description: 'Slavín je vojenský cintorín a pamätník, kde sú pochovaní sovietski vojaci padlí počas oslobodenia Bratislavy v apríli 1945. Dominantou je 39-metrový obelisk korunovaný sochou vojaka. Z vyhliadkovej terasy cintorína je jeden z najkrajších výhľadov na Bratislavu a okolie.',
    address: 'Misíkova, 811 01 Bratislava',
    built: '1960',
    icon: '🕊️', color: '#ea580c',
  },

  /* ── Dôležité mestské miesta ─────────────────────────────── */
  {
    id: 'magistrat',
    name: 'Magistrát hl. mesta Bratislavy',
    nameEn: 'Bratislava City Hall',
    category: 'urad',
    lat: 48.1445, lng: 17.1091,
    description: 'Magistrát hlavného mesta SR Bratislavy je sídlo mestskej samosprávy. Poskytuje všetky služby súvisiace so správou mesta – povolenia, registrácie, informácie pre občanov aj turistov. Otváracie hodiny: Po–Pi 8:00–17:00.',
    address: 'Primaciálne nám. 1, 814 99 Bratislava',
    icon: '🏛️', color: '#6d28d9',
  },
  {
    id: 'policia-kr',
    name: 'Krajské riaditeľstvo PZ',
    nameEn: 'Regional Police HQ',
    category: 'policia',
    lat: 48.1483, lng: 17.1171,
    description: 'Krajské riaditeľstvo Policajného zboru v Bratislave. V prípade núdze volajte tiesňovú linku 158 (polícia) alebo 112 (európska tiesňová linka). Polícia zabezpečuje verejný poriadok a bezpečnosť občanov.',
    address: 'Gunduličova 10, 812 72 Bratislava',
    icon: '👮', color: '#1d4ed8',
  },
  {
    id: 'mestska-policia',
    name: 'Mestská polícia Bratislava',
    nameEn: 'City Police Bratislava',
    category: 'policia',
    lat: 48.1477, lng: 17.1106,
    description: 'Mestská polícia Bratislava zabezpečuje verejný poriadok na území mesta. Linka mestskej polície: 159. Hliadky sú nepretržite k dispozícii v celom meste.',
    address: 'Staré Mesto, Bratislava',
    icon: '🚔', color: '#1d4ed8',
  },
  {
    id: 'hlavna-stanica',
    name: 'Hlavná železničná stanica',
    nameEn: 'Bratislava Main Train Station',
    category: 'doprava',
    lat: 48.1577, lng: 17.1068,
    // confirmed: en.wikipedia.org/api/rest_v1/page/summary/Bratislava_hlavn%C3%A1_stanica
    photo: `${CDN}/8/83/Bratislava_hlavn%C3%A1_stanica_September_2019.jpg/640px-Bratislava_hlavn%C3%A1_stanica_September_2019.jpg`,
    description: 'Bratislava hlavná stanica je najväčšia a najdôležitejšia železničná stanica v Bratislave. Odchádzajú odtiaľto vlaky do celej SR, medzinárodné spoje do Viedne, Prahy, Budapešti a ďalších miest. V priestoroch stanice sa nachádzajú obchody, reštaurácie a informačné centrum.',
    address: 'Predstaničné nám. 1, 811 04 Bratislava',
    icon: '🚂', color: '#b45309',
  },
  {
    id: 'as-nivy',
    name: 'Autobusová stanica Nivy',
    nameEn: 'Nivy Bus Station',
    category: 'doprava',
    lat: 48.1473, lng: 17.1258,
    description: 'Moderná autobusová stanica Nivy (Nivy Station) je centrálnym terminálovým uzlom medzimestskej a medzinárodnej autobusovej dopravy. Nachádza sa v obchodnom centre Nivy. Odchádzajú odtiaľto autobusy do celej SR aj do zahraničia.',
    address: 'Mlynské Nivy 31, 821 09 Bratislava',
    icon: '🚌', color: '#b45309',
  },
  {
    id: 'nemocnica-kramare',
    name: 'Nemocnica Kramáre (UNB)',
    nameEn: 'Kramáre University Hospital',
    category: 'nemocnica',
    lat: 48.1663, lng: 17.0863,
    description: 'Univerzitná nemocnica Bratislava – Nemocnica akad. L. Dérera na Kramároch je jednou z najväčších nemocníc na Slovensku. Poskytuje komplexnú zdravotnícku starostlivosť vrátane pohotovosti. Pohotovosť: nonstop. Tel: +421 2 5954 1111.',
    address: 'Limbová 5, 833 05 Bratislava',
    icon: '🏥', color: '#e11d48',
  },
  {
    id: 'nemocnica-sv-michala',
    name: 'Nemocnica sv. Michala (UNB)',
    nameEn: 'St. Michael Hospital',
    category: 'nemocnica',
    lat: 48.1464, lng: 17.1178,
    description: 'Univerzitná nemocnica svätého Michala (Ružová dolina) je nemocnica v centre Bratislavy. Poskytuje zdravotnícke služby vo viacerých odbornostiach. Tel: +421 2 4823 0111.',
    address: 'Ružová dolina 10, 826 06 Bratislava',
    icon: '🏥', color: '#e11d48',
  },
  {
    id: 'lekaren-centrum',
    name: 'Lekáreň Obchodná',
    nameEn: 'Central Pharmacy',
    category: 'lekaren',
    lat: 48.1448, lng: 17.1072,
    description: 'Lekáreň na Obchodnej ulici v centre Bratislavy. Ponúka voľnopredajné lieky, výdaj na predpis a zdravotnícke poradenstvo. Otváracie hodiny: Po–Pi 8:00–20:00, So 9:00–14:00.',
    address: 'Obchodná ul., 811 06 Bratislava',
    icon: '💊', color: '#15803d',
  },
  {
    id: 'hlavna-posta',
    name: 'Slovenská pošta – Bratislava 1',
    nameEn: 'Main Post Office',
    category: 'posta',
    lat: 48.1455, lng: 17.1090,
    description: 'Hlavná pobočka Slovenskej pošty v centre Bratislavy. Poskytuje všetky poštové služby – odosielanie listov a balíkov, poštové poukazy, predaj cenín. Otváracie hodiny: Po–Pi 8:00–19:00, So 9:00–13:00.',
    address: 'Námestie SNP 34, 810 00 Bratislava',
    icon: '📮', color: '#d97706',
  },
];
