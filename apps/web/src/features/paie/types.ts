export type PaieCorrectionStatut = "EN_ATTENTE" | "VALIDEE";

export type PaieCorrection = {
  id: string;
  statut: PaieCorrectionStatut;
  motif: string;
  corrigeeAt: string;
  corrigeePar: { id: string; firstName: string; lastName: string };
  valideeAt: string | null;
  valideePar: { id: string; firstName: string; lastName: string } | null;
};

export type PaiePreviewRow = {
  userId: string;
  firstName: string;
  lastName: string;
  tauxHoraire: number | null;
  totalHeuresTravaillees: number;
  heuresMajorees: number;
  coutHeuresNormales: number;
  coutMajoration: number;
  coutMainOeuvreMajore: number;
  coutTotal: number;
  details: PaiePreviewDetail[];
  nombreIndemnites: number;
  montantIndemnites: number;
  indemnites: PaiePreviewIndemnite[];
  chantiers: string[];
  heuresMajoreesCorrigees: number | null;
  nombreIndemnitesCorrigees: number | null;
  heuresMajoreesRetenues: number;
  nombreIndemnitesRetenues: number;
  correction: PaieCorrection | null;
};

export type PaiePreviewDetail = {
  chantier: string;
  zoneCategorie: number;
  tauxHoraire: number | null;
  tauxMajoration: number;
  heuresValidees: number;
  coutHeuresNormales: number;
  coutMajoration: number;
  coutMainOeuvreMajore: number;
};

export type PaiePreviewIndemnite = {
  id: string;
  libelle: string;
  montant: number | null;
  quantite: number;
};

export type PeriodePaie = {
  dateFrom: string;
  dateTo: string;
};

export type CreatePaieCorrectionDto = {
  userId: string;
  dateFrom: string;
  dateTo: string;
  heuresMajorees?: number;
  nombreIndemnites?: number;
  motif: string;
};
