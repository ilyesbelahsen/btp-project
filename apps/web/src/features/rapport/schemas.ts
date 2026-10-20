import { z } from "zod";

export const DashboardStatsSchema = z.object({
  chantiersActifs: z.number(),
  caTotalHT: z.number(),
  depensesTotales: z.number(),
  coutMainOeuvre: z.number(),
  coutTotal: z.number(),
  margeGlobale: z.number(),
});

export const ChantierSyntheseSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  zoneCategorie: z.number().nullable(),
  prixVenteHT: z.number(),
  depensesTotales: z.number(),
  coutMainOeuvre: z.number(),
  coutTotal: z.number(),
  marge: z.number(),
  tauxRentabilite: z.number().nullable(),
  alertLevel: z.enum(["ok", "warning", "critical"]),
});

export const ChantierSyntheseListSchema = z.array(ChantierSyntheseSchema);

const SuiviBudgetaireSchema = z.object({
  budget: z.number(),
  coutReel: z.number(),
  ecart: z.number(),
  statut: z.enum(["ok", "depassement"]),
});

export const IndicateursChantierSchema = z.object({
  chantierId: z.string(),
  chantierName: z.string(),
  perimetre: z.literal("chantier"),
  periodeDebut: z.string(),
  periodeFin: z.string().nullable(),
  budgetMainOeuvre: z.number(),
  budgetMateriaux: z.number(),
  budgetTotal: z.number(),
  coefficient: z.number(),
  chargeFixe: z.number(),
  margeVisee: z.number(),
  prixVenteHT: z.number(),
  coutDepenses: z.number(),
  coutMainOeuvre: z.number(),
  coutMainOeuvreMajore: z.number(),
  coutTotal: z.number(),
  coutReel: z.number(),
  totalMinutesValides: z.number().int().nonnegative(),
  marge: z.number(),
  margeNette: z.number(),
  tauxRentabilite: z.number().nullable(),
  suiviMainOeuvre: SuiviBudgetaireSchema,
  suiviMateriaux: SuiviBudgetaireSchema,
});

export const SuiviTacheSchema = z.object({
  tacheId: z.string(),
  libelle: z.string(),
  minutesMainOeuvre: z.number().int().nonnegative(),
  heuresMainOeuvre: z.number(),
  coutMainOeuvreInterne: z.number(),
  coutMainOeuvreMajore: z.number(),
  depensesMainOeuvre: z.number(),
  depensesMateriaux: z.number(),
  coutTotal: z.number(),
  suiviMainOeuvre: SuiviBudgetaireSchema,
  suiviMateriaux: SuiviBudgetaireSchema,
});

export const SuiviTachesListSchema = z.array(SuiviTacheSchema);
