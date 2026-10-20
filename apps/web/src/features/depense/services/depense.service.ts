import { api } from "@/services/api";
import { z } from "zod";
import type {
  ControleDepenseDto,
  CreateDepenseDto,
  Depense,
  DepenseControleHistorique,
} from "@/features/depense/types";

const DepenseSchema = z.object({
  id: z.string(),
  chantierId: z.string(),
  companyId: z.string(),
  tacheId: z.string().nullable(),
  tacheLibelle: z.string().nullable(),
  categorie: z.enum([
    "MATERIEL",
    "MAIN_OEUVRE",
    "SOUS_TRAITANCE",
    "TRANSPORT",
    "AUTRE",
  ]),
  montant: z.number(),
  description: z.string(),
  fournisseur: z.string().nullable(),
  statutControle: z.enum(["A_CONTROLER", "ACCEPTEE", "REJETEE"]),
  motifRejet: z.string().nullable(),
  controleeAt: z.string().nullable(),
  controleeParId: z.string().nullable(),
  date: z.string(),
  createdAt: z.string(),
});

const DepenseControleHistoriqueSchema = z.object({
  id: z.string(),
  depenseId: z.string(),
  statut: z.enum(["A_CONTROLER", "ACCEPTEE", "REJETEE"]),
  motif: z.string().nullable(),
  auteurId: z.string(),
  createdAt: z.string(),
  auteur: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
});

export const depenseService = {
  create: async (dto: CreateDepenseDto): Promise<Depense> => {
    const idempotencyKey = globalThis.crypto.randomUUID();
    const { data } = await api.post("/depenses", dto, {
      headers: { "Idempotency-Key": idempotencyKey },
    });
    return DepenseSchema.parse(data);
  },

  findByChantier: async (chantierId: string): Promise<Depense[]> => {
    const { data } = await api.get("/depenses", {
      params: { chantierId },
    });
    return z.array(DepenseSchema).parse(data);
  },

  controler: async (id: string, dto: ControleDepenseDto): Promise<Depense> => {
    const { data } = await api.patch(`/depenses/${id}/controle`, dto);
    return DepenseSchema.parse(data);
  },

  historique: async (id: string): Promise<DepenseControleHistorique[]> => {
    const { data } = await api.get(`/depenses/${id}/historique`);
    return z.array(DepenseControleHistoriqueSchema).parse(data);
  },
};
