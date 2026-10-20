import { z } from "zod";

const HistoriqueSchema = z.object({
  id: z.string(),
  zoneCategorie: z.number().int(),
  tauxMajoration: z.number(),
  dateEffet: z.string(),
  createdAt: z.string(),
});

export const ZoneMajorationSchema = z.object({
  zoneCategorie: z.number().int(),
  tauxMajoration: z.number().nonnegative(),
  historique: z.array(HistoriqueSchema),
});

export const ZoneMajorationListSchema = z.array(ZoneMajorationSchema);
