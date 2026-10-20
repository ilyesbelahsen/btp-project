export const POINTAGE_STATUSES = [
  "EN_COURS",
  "TERMINE",
  "SOUMIS",
  "REJETE",
  "VALIDE",
] as const;
export type PointageStatus = (typeof POINTAGE_STATUSES)[number];

export type Pointage = {
  id: string;
  userId: string;
  chantierId: string;
  status: PointageStatus;
  startTime: string;
  endTime?: string | null;
  totalMinutes?: number | null;
  totalHours?: number | null;
  taches?: string[];
  comment?: string | null;
  rejectionReason?: string | null;
  chantier?: { id: string; name: string };
};

export type HistoriquePage = {
  data: Pointage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PointageStats = {
  totalHeures: number;
  totalJours: number;
  dernierPointage: string | null;
  mois: string;
};

export type RepartitionTache = {
  tacheId: string;
  minutes: number;
};
