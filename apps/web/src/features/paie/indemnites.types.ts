export type Indemnite = {
  id: string;
  libelle: string;
  montant: number | null;
  regle: string | null;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
};

export type IndemniteAffectation = {
  id: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
  quantite: number;
  note: string | null;
  indemnite: Indemnite;
  user: { id: string; firstName: string; lastName: string };
  createdBy: { id: string; firstName: string; lastName: string };
};

export type CreateIndemniteDto = {
  libelle: string;
  montant?: number;
  regle?: string;
};

export type UpdateIndemniteDto = Partial<CreateIndemniteDto> & {
  actif?: boolean;
};

export type CreateIndemniteAffectationDto = {
  indemniteId: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
  quantite?: number;
  note?: string;
};

export type UpdateIndemniteAffectationDto = Partial<
  Pick<
    CreateIndemniteAffectationDto,
    "dateFrom" | "dateTo" | "quantite" | "note"
  >
>;
