export const TACHE_TYPES = [
  'COFFRAGE',
  'MACONNERIE',
  'FERRAILLAGE',
  'BETON',
  'FINITION',
  'DEMOLITION',
  'TERRASSEMENT',
  'PLOMBERIE',
  'ELECTRICITE',
  'AUTRE',
] as const;

export type TacheType = (typeof TACHE_TYPES)[number];
