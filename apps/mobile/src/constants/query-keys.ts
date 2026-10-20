export const queryKeys = {
  pointageToday: () => ["pointage-today"] as const,
  mesChantiers: () => ["mes-chantiers"] as const,
  tachesChantier: (chantierId: string) =>
    ["taches-chantier", chantierId] as const,
  historique: (page: number, mois: string) =>
    ["historique", page, mois] as const,
  mesStats: (mois: string) => ["mes-stats", mois] as const,
} as const;
