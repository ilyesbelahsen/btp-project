export const CHANTIER_STATUSES = [
  "EN_COURS",
  "TERMINE",
  "EN_PAUSE",
  "ANNULE",
] as const;
export type ChantierStatus = (typeof CHANTIER_STATUSES)[number];

export type Chantier = {
  id: string;
  name: string;
  address: string;
  status: ChantierStatus;
  companyId: string;
  startDate: string;
};

export type TacheChantier = {
  id: string;
  libelle: string;
  prixVenduHT: number | null;
  budgetMainOeuvre: number | null;
  budgetMateriaux: number | null;
};
