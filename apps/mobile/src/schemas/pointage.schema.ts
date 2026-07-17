import { z } from "zod";
import { POINTAGE_STATUSES } from "@/src/types/pointage.type";

export const PointageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  chantierId: z.string(),
  status: z.enum(POINTAGE_STATUSES),
  startTime: z.string(),
  endTime: z.string().optional(),
  totalHours: z.number().nullable().optional(),
  taches: z.array(z.string()).optional(),
  comment: z.string().optional(),
  chantier: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),
});

export const HistoriquePageSchema = z.object({
  data: z.array(PointageSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const PointageStatsSchema = z.object({
  totalHeures: z.number(),
  totalJours: z.number(),
  dernierPointage: z.string().nullable(),
  mois: z.string(),
});
