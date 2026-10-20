export type ChantierStatus = "EN_COURS" | "TERMINE" | "EN_PAUSE" | "ANNULE";

export type Chantier = {
  id: string;
  name: string;
  address: string;
  client: string | null;
  status: ChantierStatus;
  budget: number | null;
  budgetMainOeuvre: number | null;
  budgetMateriaux: number | null;
  coefficient: number;
  marge: number | null;
  prixVenteHT: number;
  zoneCategorie: number | null;
  startDate: string;
  endDate: string | null;
  companyId: string;
  createdAt: string;
};

export type CreateChantierDto = {
  name: string;
  address: string;
  client: string;
  budgetMainOeuvre: number;
  budgetMateriaux: number;
  coefficient: number;
  prixVenteHT: number;
  zoneCategorie: number;
  startDate: string;
  endDate?: string;
};

export type UpdateChantierDto = {
  name?: string;
  address?: string;
  client?: string;
  budgetMainOeuvre?: number;
  budgetMateriaux?: number;
  coefficient?: number;
  prixVenteHT?: number;
  zoneCategorie?: number;
  startDate?: string;
  endDate?: string;
};

export type TacheChantier = {
  id: string;
  chantierId: string;
  libelle: string;
  prixVenduHT: number | null;
  budgetMainOeuvre: number | null;
  budgetMateriaux: number | null;
  createdAt: string;
};

export type TacheDevisInput = {
  libelle: string;
  prixVenduHT: number | null;
  budgetMainOeuvre?: number | null;
  budgetMateriaux?: number | null;
};

export type UpdateTacheDto = {
  libelle?: string;
  prixVenduHT?: number | null;
  budgetMainOeuvre?: number | null;
  budgetMateriaux?: number | null;
};

export type OuvrierAffecte = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};
