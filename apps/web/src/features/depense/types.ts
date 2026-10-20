export type DepenseCategorie =
  | "MATERIEL"
  | "MAIN_OEUVRE"
  | "SOUS_TRAITANCE"
  | "TRANSPORT"
  | "AUTRE";

export type DepenseStatutControle = "A_CONTROLER" | "ACCEPTEE" | "REJETEE";

export const DEPENSE_STATUT_CONTROLE_LABELS: Record<
  DepenseStatutControle,
  string
> = {
  A_CONTROLER: "À contrôler",
  ACCEPTEE: "Acceptée",
  REJETEE: "Rejetée",
};

export const DEPENSE_CATEGORIE_LABELS: Record<DepenseCategorie, string> = {
  MATERIEL: "Matériaux",
  MAIN_OEUVRE: "Main d'œuvre",
  SOUS_TRAITANCE: "Sous-traitance",
  TRANSPORT: "Transport (historique)",
  AUTRE: "Autre frais (historique)",
};

// BR-C-009 : catégories proposées à la saisie d'une nouvelle dépense manuelle
export const DEPENSE_CATEGORIE_SAISIE: DepenseCategorie[] = [
  "MATERIEL",
  "MAIN_OEUVRE",
  "SOUS_TRAITANCE",
];

export type Depense = {
  id: string;
  chantierId: string;
  companyId: string;
  tacheId: string | null;
  tacheLibelle: string | null;
  categorie: DepenseCategorie;
  montant: number;
  description: string;
  fournisseur: string | null;
  statutControle: DepenseStatutControle;
  motifRejet: string | null;
  controleeAt: string | null;
  controleeParId: string | null;
  date: string;
  createdAt: string;
};

export type CreateDepenseDto = {
  chantierId: string;
  tacheId: string;
  categorie: DepenseCategorie;
  montant: number;
  date: string;
  description?: string;
  fournisseur?: string;
};

export type ControleDepenseDto = {
  statut: DepenseStatutControle;
  motifRejet?: string;
};

export type DepenseControleHistorique = {
  id: string;
  depenseId: string;
  statut: DepenseStatutControle;
  motif: string | null;
  auteurId: string;
  createdAt: string;
  auteur: { id: string; firstName: string; lastName: string };
};
