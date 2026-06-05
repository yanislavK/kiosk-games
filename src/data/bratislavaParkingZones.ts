export interface ParkingZone {
  id: string;
  name: string;
  code: 'A' | 'B' | 'C';
  color: string;
  pricePerHour: number;
  freeMinutes: number;
  description: string;
  hours: string;
  polygon: [number, number][];
}

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  zone: 'A' | 'B' | 'C';
  capacity: number;
  type: 'garage' | 'open';
  pricePerHour: number;
  openHours: string;
}

// Real Bratislava BPK parking zones (approximate polygons)
export const PARKING_ZONES: ParkingZone[] = [
  {
    id: 'zone-a',
    name: 'Zóna A – Historické centrum',
    code: 'A',
    color: '#dc2626',
    pricePerHour: 2.50,
    freeMinutes: 0,
    description: 'Historické jadro mesta. Platí sa každý deň.',
    hours: 'Po–Ne 8:00–22:00',
    polygon: [
      [48.1477, 17.1035],
      [48.1499, 17.1080],
      [48.1492, 17.1158],
      [48.1468, 17.1226],
      [48.1436, 17.1233],
      [48.1402, 17.1179],
      [48.1399, 17.1103],
      [48.1419, 17.1043],
      [48.1446, 17.1016],
      [48.1477, 17.1035],
    ],
  },
  {
    id: 'zone-b',
    name: 'Zóna B – Rozšírené centrum',
    code: 'B',
    color: '#ea580c',
    pricePerHour: 1.00,
    freeMinutes: 15,
    description: 'Oblasti okolo historického centra. Prvých 15 min zadarmo.',
    hours: 'Po–Pi 8:00–20:00, So 8:00–14:00',
    polygon: [
      [48.1549, 17.0928],
      [48.1580, 17.1042],
      [48.1581, 17.1180],
      [48.1551, 17.1330],
      [48.1490, 17.1372],
      [48.1412, 17.1347],
      [48.1352, 17.1248],
      [48.1331, 17.1094],
      [48.1365, 17.0950],
      [48.1449, 17.0900],
      [48.1549, 17.0928],
    ],
  },
  {
    id: 'zone-c-ruzinov',
    name: 'Zóna C – Ružinov / Komárov',
    code: 'C',
    color: '#ca8a04',
    pricePerHour: 0.50,
    freeMinutes: 30,
    description: 'Obytné štvrte Ružinova a Komárova. Prvých 30 min zadarmo.',
    hours: 'Po–Pi 8:00–18:00',
    polygon: [
      [48.1551, 17.1330],
      [48.1578, 17.1460],
      [48.1582, 17.1745],
      [48.1492, 17.2058],
      [48.1358, 17.2015],
      [48.1278, 17.1808],
      [48.1292, 17.1522],
      [48.1312, 17.1372],
      [48.1412, 17.1347],
      [48.1490, 17.1372],
      [48.1551, 17.1330],
    ],
  },
  {
    id: 'zone-c-nove-mesto',
    name: 'Zóna C – Nové Mesto',
    code: 'C',
    color: '#ca8a04',
    pricePerHour: 0.50,
    freeMinutes: 30,
    description: 'Obytné štvrte Nového Mesta. Prvých 30 min zadarmo.',
    hours: 'Po–Pi 8:00–18:00',
    polygon: [
      [48.1581, 17.1180],
      [48.1624, 17.1188],
      [48.1672, 17.1312],
      [48.1662, 17.1408],
      [48.1602, 17.1462],
      [48.1551, 17.1330],
      [48.1581, 17.1180],
    ],
  },
];

// Real Bratislava parking facilities
export const PARKING_LOTS: ParkingLot[] = [
  {
    id: 'lot-manderak',
    name: 'Parkovanie Manderák',
    address: 'Obchodná 22, Staré Mesto',
    lat: 48.1453,
    lng: 17.1140,
    zone: 'A',
    capacity: 200,
    type: 'garage',
    pricePerHour: 2.50,
    openHours: '24/7',
  },
  {
    id: 'lot-corvinus',
    name: 'Garáže Corvinus',
    address: 'Štefánikova 3, Staré Mesto',
    lat: 48.1498,
    lng: 17.1093,
    zone: 'A',
    capacity: 150,
    type: 'garage',
    pricePerHour: 2.00,
    openHours: '6:00–24:00',
  },
  {
    id: 'lot-hodzovo',
    name: 'Parkovisko Hodžovo nám.',
    address: 'Hodžovo námestie, Staré Mesto',
    lat: 48.1479,
    lng: 17.1084,
    zone: 'A',
    capacity: 80,
    type: 'open',
    pricePerHour: 2.50,
    openHours: '24/7',
  },
  {
    id: 'lot-aupark',
    name: 'Parkovisko Aupark',
    address: 'Einsteinova 18, Petržalka',
    lat: 48.1356,
    lng: 17.1073,
    zone: 'B',
    capacity: 1800,
    type: 'garage',
    pricePerHour: 1.00,
    openHours: '24/7',
  },
  {
    id: 'lot-eurovea',
    name: 'Parkovisko Eurovea',
    address: 'Pribinova 8, Ružinov',
    lat: 48.1432,
    lng: 17.1272,
    zone: 'B',
    capacity: 900,
    type: 'garage',
    pricePerHour: 1.20,
    openHours: '24/7',
  },
  {
    id: 'lot-polus',
    name: 'Parkovisko Polus City Center',
    address: 'Vajnorská 100, Nové Mesto',
    lat: 48.1604,
    lng: 17.1337,
    zone: 'C',
    capacity: 2000,
    type: 'open',
    pricePerHour: 0.50,
    openHours: '8:00–22:00',
  },
  {
    id: 'lot-ruzinov',
    name: 'Parkovisko Ružinovská',
    address: 'Ružinovská 28, Ružinov',
    lat: 48.1468,
    lng: 17.1523,
    zone: 'C',
    capacity: 120,
    type: 'open',
    pricePerHour: 0.50,
    openHours: 'Po–Pi 8:00–18:00',
  },
  {
    id: 'lot-komarov',
    name: 'Parkovisko Komárov',
    address: 'Svornosti 30, Komárov',
    lat: 48.1345,
    lng: 17.1908,
    zone: 'C',
    capacity: 60,
    type: 'open',
    pricePerHour: 0.50,
    openHours: 'Po–Pi 8:00–18:00',
  },
];

export const ZONE_COLORS: Record<'A' | 'B' | 'C', string> = {
  A: '#dc2626',
  B: '#ea580c',
  C: '#ca8a04',
};
