export interface GameDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  gradient: string;
  icon: string;
  available: boolean;
  comingSoon?: string;
}

export const GAMES: GameDefinition[] = [
  {
    id: 'tictactoe',
    title: 'KRÍŽIKY – NULIČKY',
    subtitle: 'Zahrajte si a zabavte sa!',
    description: 'Klasická hra pre 1 alebo 2 hráčov. Hrajte proti AI alebo priateľovi!',
    color: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    icon: '✕ ○',
    available: true,
  },
  {
    id: 'memory',
    title: 'PAMÄŤ / NÁJDI PÁRY',
    subtitle: 'Nájdite všetky rovnaké dvojice!',
    description: 'Otočte kartičky a nájdite páry slovenských pamiatok! 3 úrovne obtiažnosti.',
    color: '#16a34a',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    icon: '🃏',
    available: true,
  },
  {
    id: 'puzzle',
    title: 'PUZZLE',
    subtitle: 'Poskladajte obrázok!',
    description: '4 slovenské pamiatky, 3 úrovne obtiažnosti. Poskladajte puzzle čo najrýchlejšie!',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    icon: '🧩',
    available: true,
  },
  {
    id: 'quiz',
    title: 'KVÍZ O MESTE',
    subtitle: 'Otestujte svoje vedomosti!',
    description: '10 otázok o Bratislave – histórii, pamiatkach a zaujímavostiach!',
    color: '#ea580c',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    icon: '❓',
    available: true,
  },
  {
    id: 'mathquiz',
    title: 'MATEMATIKA',
    subtitle: 'Vypočítaj príklady!',
    description: 'Sčítanie, odčítanie, násobenie, delenie. Séria správnych odpovedí = bonusové body!',
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    icon: '🧮',
    available: true,
  },
  {
    id: 'trafficquiz',
    title: 'KVÍZ O DOPRAVE',
    subtitle: 'Vyber správnu odpoveď!',
    description: '10 otázok o dopravných predpisoch, značkách a pravidlách cestnej premávky.',
    color: '#d97706',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    icon: '🚦',
    available: true,
  },
  {
    id: 'matching',
    title: 'PAMIATKY',
    subtitle: 'Spárujte city landmarks!',
    description: 'Spárujte slovenské pamiatky s ich názvami!',
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    icon: '🏛️',
    available: false,
    comingSoon: 'Čoskoro',
  },
  {
    id: 'map',
    title: 'MAPA SLOVENSKA',
    subtitle: 'Spoznajte Slovensko!',
    description: 'Ukážte na mape, kde sa nachádzajú slovenské mestá!',
    color: '#be185d',
    gradient: 'linear-gradient(135deg, #be185d 0%, #9d174d 100%)',
    icon: '🗺️',
    available: false,
    comingSoon: 'Čoskoro',
  },
];
