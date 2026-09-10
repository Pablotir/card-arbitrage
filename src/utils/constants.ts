export const GRADE_OPTIONS = [
  'Raw (Ungraded)',
  'PSA 10',
  'PSA 9',
  'PSA 8',
  'CGC 10',
  'BGS 10',
  'BGS 10 Black Label',
  'CGC 10 Pristine'
] as const;

export const CONDITION_OPTIONS = [
  'Near Mint',
  'Lightly Played',
  'Moderately Played',
  'Any'
] as const;

export interface PopularSetBadge {
  id: string;
  name: string;
  query: string;
  isNew?: boolean;
}

export const POPULAR_POKEMON_SETS: PopularSetBadge[] = [
  { id: '30th', name: '30th Celebration', query: '30th Celebration', isNew: true },
  { id: 'delta-reign', name: 'Delta Reign', query: 'Delta Reign', isNew: true },
  { id: 'prismatic', name: 'Prismatic Evolutions', query: 'Prismatic Evolutions', isNew: true },
  { id: 'surging-sparks', name: 'Surging Sparks', query: 'Surging Sparks' },
  { id: '151', name: 'Pokémon 151', query: '151' },
  { id: 'crown-zenith', name: 'Crown Zenith', query: 'Crown Zenith' },
  { id: 'twilight', name: 'Twilight Masquerade', query: 'Twilight Masquerade' }
];

export const POPULAR_ONEPIECE_SETS: PopularSetBadge[] = [
  { id: 'op-09', name: 'OP-09 Emperors', query: 'OP-09', isNew: true },
  { id: 'op-08', name: 'OP-08 Two Legends', query: 'OP-08' },
  { id: 'op-07', name: 'OP-07 500 Years', query: 'OP-07' },
  { id: 'op-06', name: 'OP-06 Wings of Captain', query: 'OP-06' },
  { id: 'op-05', name: 'OP-05 Awakening', query: 'OP-05' }
];
