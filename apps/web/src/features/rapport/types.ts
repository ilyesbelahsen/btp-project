export type DashboardStats = {
  chantiersActifs: number;
  caTotalHT: number;
  depensesTotales: number;
  coutMainOeuvre: number;
  coutTotal: number;
  margeGlobale: number;
};

export type AlertLevel = "ok" | "warning" | "critical";

// BR-C-015 : statut vert (dans le budget) ou rouge (en dépassement)
export type StatutBudget = "ok" | "depassement";

export type SuiviBudgetaire = {
  budget: number;
  coutReel: number;
  ecart: number;
  statut: StatutBudget;
};

export type ChantierSynthese = {
  id: string;
  name: string;
  status: string;
  zoneCategorie: number | null;
  prixVenteHT: number;
  depensesTotales: number;
  coutMainOeuvre: number;
  coutTotal: number;
  marge: number;
  tauxRentabilite: number | null;
  alertLevel: AlertLevel;
};

export type IndicateursChantier = {
  chantierId: string;
  chantierName: string;
  perimetre: "chantier";
  periodeDebut: string;
  periodeFin: string | null;
  budgetMainOeuvre: number;
  budgetMateriaux: number;
  budgetTotal: number;
  coefficient: number;
  chargeFixe: number;
  margeVisee: number;
  prixVenteHT: number;
  coutDepenses: number;
  coutMainOeuvre: number;
  coutMainOeuvreMajore: number;
  coutTotal: number;
  coutReel: number;
  totalMinutesValides: number;
  marge: number;
  margeNette: number;
  tauxRentabilite: number | null;
  suiviMainOeuvre: SuiviBudgetaire;
  suiviMateriaux: SuiviBudgetaire;
};

// BR-C-016 : même comparaison budget vs réel déclinée par tâche
export type SuiviTache = {
  tacheId: string;
  libelle: string;
  minutesMainOeuvre: number;
  heuresMainOeuvre: number;
  coutMainOeuvreInterne: number;
  coutMainOeuvreMajore: number;
  depensesMainOeuvre: number;
  depensesMateriaux: number;
  coutTotal: number;
  suiviMainOeuvre: SuiviBudgetaire;
  suiviMateriaux: SuiviBudgetaire;
};
