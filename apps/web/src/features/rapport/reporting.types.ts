export type ReportingSeriePoint = {
  date: string;
  entrees: number;
  sorties: number;
  soldeCumule: number;
};

export type ReportingChantier = {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string | null;
  coutMainOeuvre: number;
  coutSousTraitance: number;
  coutMateriaux: number;
  coutAutres: number;
  coutTotal: number;
};

export type ReportingGlobal = {
  dateFrom: string;
  dateTo: string;
  chantierId: string | null;
  capitalInitial: number;
  totalEntrees: number;
  totalSorties: number;
  soldeNet: number;
  tresorerieFinale: number;
  coutMainOeuvre: number;
  coutSousTraitance: number;
  coutMateriaux: number;
  coutAutres: number;
  coutTotal: number;
  serie: ReportingSeriePoint[];
  chantiers: ReportingChantier[];
};