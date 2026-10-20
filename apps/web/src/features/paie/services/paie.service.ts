import { api } from "@/services/api";
import { z } from "zod";
import type {
  CreatePaieCorrectionDto,
  PaiePreviewRow,
  PeriodePaie,
} from "@/features/paie/types";

const PaieCorrectionSchema = z.object({
  id: z.string(),
  statut: z.enum(["EN_ATTENTE", "VALIDEE"]),
  motif: z.string(),
  corrigeeAt: z.string(),
  corrigeePar: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  valideeAt: z.string().nullable(),
  valideePar: z
    .object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
    })
    .nullable(),
});

const PaiePreviewRowSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  tauxHoraire: z.number().nullable(),
  totalHeuresTravaillees: z.number(),
  heuresMajorees: z.number(),
  coutMainOeuvreMajore: z.number(),
  details: z.array(
    z.object({
      chantier: z.string(),
      zoneCategorie: z.number().int(),
      tauxHoraire: z.number().nullable(),
      tauxMajoration: z.number().nonnegative(),
      heuresValidees: z.number(),
      coutMainOeuvreMajore: z.number(),
    }),
  ),
  nombreIndemnites: z.number(),
  montantIndemnites: z.number(),
  indemnites: z.array(
    z.object({
      id: z.string(),
      libelle: z.string(),
      montant: z.number().nullable(),
      quantite: z.number(),
    }),
  ),
  chantiers: z.array(z.string()),
  heuresMajoreesCorrigees: z.number().nullable(),
  nombreIndemnitesCorrigees: z.number().nullable(),
  heuresMajoreesRetenues: z.number(),
  nombreIndemnitesRetenues: z.number(),
  correction: PaieCorrectionSchema.nullable(),
});

export const paieService = {
  getPreview: async (periode: PeriodePaie): Promise<PaiePreviewRow[]> => {
    const { data } = await api.get("/paie/preview", {
      params: { dateFrom: periode.dateFrom, dateTo: periode.dateTo },
    });
    return z.array(PaiePreviewRowSchema).parse(data);
  },
  getExport: async (periode: PeriodePaie): Promise<PaiePreviewRow[]> => {
    const { data } = await api.get("/paie/export", {
      params: { dateFrom: periode.dateFrom, dateTo: periode.dateTo },
    });
    return z.array(PaiePreviewRowSchema).parse(data);
  },
  createCorrection: async (dto: CreatePaieCorrectionDto) => {
    const { data } = await api.post("/paie/corrections", dto);
    return PaieCorrectionSchema.parse(data);
  },
  validateCorrection: async (id: string) => {
    const { data } = await api.patch(`/paie/corrections/${id}/valider`);
    return PaieCorrectionSchema.parse(data);
  },
  getCorrectionHistory: async (id: string) => {
    const { data } = await api.get(`/paie/corrections/${id}/historique`);
    return data;
  },
};
