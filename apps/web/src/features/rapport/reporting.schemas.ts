import { z } from "zod";

const ReportingSerieSchema = z.object({
  date: z.string(),
  entrees: z.number(),
  sorties: z.number(),
  soldeCumule: z.number(),
});

const ReportingChantierSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  coutMainOeuvre: z.number(),
  coutSousTraitance: z.number(),
  coutMateriaux: z.number(),
  coutAutres: z.number(),
  coutTotal: z.number(),
});

export const ReportingGlobalSchema = z.object({
  dateFrom: z.string(),
  dateTo: z.string(),
  chantierId: z.string().nullable(),
  capitalInitial: z.number(),
  totalEntrees: z.number(),
  totalSorties: z.number(),
  soldeNet: z.number(),
  tresorerieFinale: z.number(),
  coutMainOeuvre: z.number(),
  coutSousTraitance: z.number(),
  coutMateriaux: z.number(),
  coutAutres: z.number(),
  coutTotal: z.number(),
  serie: z.array(ReportingSerieSchema),
  chantiers: z.array(ReportingChantierSchema),
});