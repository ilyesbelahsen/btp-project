export type ZoneMajorationHistorique = {
  id: string;
  zoneCategorie: number;
  tauxMajoration: number;
  dateEffet: string;
  createdAt: string;
};

export type ZoneMajoration = {
  zoneCategorie: number;
  tauxMajoration: number;
  historique: ZoneMajorationHistorique[];
};
