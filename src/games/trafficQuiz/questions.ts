import type { TrafficQuestion } from './types';
import {
  SignStop, SignRedLight, SignSpeed50, SignYield, SignSeatbelt,
  SignSpeed130, SignPedestrian, SignDashedLine, SignSpeed90,
  SignNoEntry,
} from './signs';

export const TRAFFIC_QUESTIONS: TrafficQuestion[] = [
  {
    id: 1,
    question: 'Čo znamená tento dopravný znak?',
    Sign: SignStop,
    answers: [
      { id: 'A', text: 'Stoj, daj prednosť v jazde' },
      { id: 'B', text: 'Je povolené pokračovať' },
      { id: 'C', text: 'Pozor, nebezpečné miesto' },
    ],
    correctId: 'A',
    explanation: 'Znak STOP znamená, že vodič musí zastaviť vozidlo a dať prednosť všetkým vozidlám na prednostnej ceste.',
  },
  {
    id: 2,
    question: 'Čo znamená červené svetlo na semafore?',
    Sign: SignRedLight,
    answers: [
      { id: 'A', text: 'Voľno, môžete ísť' },
      { id: 'B', text: 'Zastavte, stoj!' },
      { id: 'C', text: 'Pripravte sa na jazdu' },
    ],
    correctId: 'B',
    explanation: 'Červené svetlo semaforu znamená príkaz zastaviť. Pokračovanie v jazde pri červenej je priestupok.',
  },
  {
    id: 3,
    question: 'Aká je maximálna povolená rýchlosť v obci (v meste)?',
    Sign: SignSpeed50,
    answers: [
      { id: 'A', text: '30 km/h' },
      { id: 'B', text: '70 km/h' },
      { id: 'C', text: '50 km/h' },
    ],
    correctId: 'C',
    explanation: 'V obci (v zastavanom území) je maximálna povolená rýchlosť 50 km/h, ak nie je označená inak.',
  },
  {
    id: 4,
    question: 'Čo znamená tento dopravný znak?',
    Sign: SignYield,
    answers: [
      { id: 'A', text: 'Zákaz vjazdu' },
      { id: 'B', text: 'Daj prednosť v jazde' },
      { id: 'C', text: 'Stoj a čakaj 30 sekúnd' },
    ],
    correctId: 'B',
    explanation: '"Daj prednosť v jazde" – vodič musí dať prednosť vozidlám na prednostnej ceste, ale nemusí úplne zastaviť.',
  },
  {
    id: 5,
    question: 'Kedy je povinné používať bezpečnostné pásy?',
    Sign: SignSeatbelt,
    answers: [
      { id: 'A', text: 'Len na diaľnici' },
      { id: 'B', text: 'Len mimo obce' },
      { id: 'C', text: 'Vždy počas jazdy' },
    ],
    correctId: 'C',
    explanation: 'Bezpečnostné pásy sú povinné vždy – v meste aj mimo mesta, na diaľnici aj na bežnej ceste.',
  },
  {
    id: 6,
    question: 'Aká je maximálna rýchlosť na diaľnici v SR?',
    Sign: SignSpeed130,
    answers: [
      { id: 'A', text: '130 km/h' },
      { id: 'B', text: '150 km/h' },
      { id: 'C', text: '110 km/h' },
    ],
    correctId: 'A',
    explanation: 'Na diaľnici a rýchlostnej ceste je maximálna povolená rýchlosť 130 km/h pre osobné automobily.',
  },
  {
    id: 7,
    question: 'Čo musíte urobiť, keď chodec čaká na prechode?',
    Sign: SignPedestrian,
    answers: [
      { id: 'A', text: 'Zatrúbiť a rýchlo prejsť' },
      { id: 'B', text: 'Spomaliť a dať prednosť' },
      { id: 'C', text: 'Pokračovať normálnou rýchlosťou' },
    ],
    correctId: 'B',
    explanation: 'Vodič je povinný spomaliť a dať prednosť chodcovi, ktorý vstúpil alebo vstupuje na prechod.',
  },
  {
    id: 8,
    question: 'Čo znamená prerušovaná čiara uprostred cesty?',
    Sign: SignDashedLine,
    answers: [
      { id: 'A', text: 'Zákaz predchádzania' },
      { id: 'B', text: 'Môžete ju bezpečne prechádzať' },
      { id: 'C', text: 'Jednosmerná premávka' },
    ],
    correctId: 'B',
    explanation: 'Prerušovaná čiara je deliaca čiara, ktorú smú vodiči prechádzať, ak je to bezpečné (napr. pri predchádzaní).',
  },
  {
    id: 9,
    question: 'Aká je maximálna rýchlosť mimo obce?',
    Sign: SignSpeed90,
    answers: [
      { id: 'A', text: '100 km/h' },
      { id: 'B', text: '80 km/h' },
      { id: 'C', text: '90 km/h' },
    ],
    correctId: 'C',
    explanation: 'Mimo zastavaného územia (mimo obce) je maximálna povolená rýchlosť 90 km/h.',
  },
  {
    id: 10,
    question: 'Čo znamená tento dopravný znak?',
    Sign: SignNoEntry,
    answers: [
      { id: 'A', text: 'Jednosmerná ulica' },
      { id: 'B', text: 'Nebezpečná zatáčka' },
      { id: 'C', text: 'Zákaz vjazdu' },
    ],
    correctId: 'C',
    explanation: 'Červený kruh s bielou vodorovnou čiarou znamená ZÁKAZ VJAZDU – do tejto ulice nesmie vojsť žiadne vozidlo.',
  },
];
