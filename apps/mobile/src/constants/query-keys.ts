export const queryKeys = {
  pointageToday: () => ["pointage-today"] as const,
  typesTaches: () => ["types-taches"] as const,
  mesChantiers: () => ["mes-chantiers"] as const,
  historique: (page: number, mois: string) =>
    ["historique", page, mois] as const,
  mesStats: (mois: string) => ["mes-stats", mois] as const,
} as const;
