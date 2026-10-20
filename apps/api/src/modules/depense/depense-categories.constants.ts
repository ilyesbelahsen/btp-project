import { DepenseCategorie } from '@prisma/client';

type DepenseBudgetImpact = 'MATERIAUX' | 'MAIN_OEUVRE' | null;

type DepenseCategorieRule = {
  label: string;
  budgetImpact: DepenseBudgetImpact;
  disponibleEnSaisie: boolean;
};

export const DEPENSE_CATEGORIE_RULES: Record<
  DepenseCategorie,
  DepenseCategorieRule
> = {
  MATERIEL: {
    label: 'Matériaux',
    budgetImpact: 'MATERIAUX',
    disponibleEnSaisie: true,
  },
  MAIN_OEUVRE: {
    label: "Main d'œuvre",
    budgetImpact: 'MAIN_OEUVRE',
    disponibleEnSaisie: true,
  },
  SOUS_TRAITANCE: {
    label: 'Sous-traitance',
    budgetImpact: 'MAIN_OEUVRE',
    disponibleEnSaisie: true,
  },
  TRANSPORT: {
    label: 'Transport (historique)',
    budgetImpact: null,
    disponibleEnSaisie: false,
  },
  AUTRE: {
    label: 'Autre frais (historique)',
    budgetImpact: null,
    disponibleEnSaisie: false,
  },
};

export const DEPENSE_CATEGORIES = Object.entries(DEPENSE_CATEGORIE_RULES).map(
  ([code, rule]) => ({
    code: code as DepenseCategorie,
    ...rule,
  }),
);
