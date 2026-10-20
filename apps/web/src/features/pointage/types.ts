export type PointageStatus =
  | "EN_COURS"
  | "TERMINE"
  | "SOUMIS"
  | "REJETE"
  | "VALIDE";

export const POINTAGE_STATUS_LABELS: Record<PointageStatus, string> = {
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  SOUMIS: "Soumis",
  REJETE: "Rejeté",
  VALIDE: "Validé",
};

export type PointageDesktop = {
  id: string;
  startTime: string;
  endTime: string | null;
  totalMinutes?: number | null;
  totalHours: number | null;
  status: PointageStatus;
  taches: string[];
  comment: string | null;
  rejectionReason: string | null;
  correctedAt: string | null;
  correctedById: string | null;
  user: { id: string; firstName: string; lastName: string };
  chantier: { id: string; name: string };
};

export type CorrigerPointageDto = {
  startTime?: string;
  endTime?: string;
  taches?: string[];
};

export type RejeterPointageDto = {
  reason: string;
};

export type PointageFiltres = {
  userId?: string;
  chantierId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};
