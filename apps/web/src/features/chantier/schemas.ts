import { z } from "zod";

export const ChantierSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  client: z.string().nullable(),
  status: z.enum(["EN_COURS", "TERMINE", "EN_PAUSE", "ANNULE"]),
  budget: z.number().nullable(),
  budgetMainOeuvre: z.number().nullable(),
  budgetMateriaux: z.number().nullable(),
  coefficient: z.number(),
  marge: z.number().nullable(),
  prixVenteHT: z.number(),
  zoneCategorie: z.number().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  companyId: z.string(),
  createdAt: z.string(),
});

export const ChantierListSchema = z.array(ChantierSchema);

export const CreateChantierSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  address: z.string().min(1, "Adresse requise"),
  client: z.string().min(1, "Client requis"),
  budgetMainOeuvre: z
    .number({ invalid_type_error: "Montant invalide" })
    .min(0, "Le budget doit être positif ou nul"),
  budgetMateriaux: z
    .number({ invalid_type_error: "Montant invalide" })
    .min(0, "Le budget doit être positif ou nul"),
  coefficient: z
    .number({ invalid_type_error: "Coefficient invalide" })
    .min(0.01, "Le coefficient doit être supérieur à 0"),
  prixVenteHT: z
    .number({ invalid_type_error: "Montant invalide" })
    .min(0, "Le prix de vente doit être positif ou nul"),
  zoneCategorie: z
    .number({ invalid_type_error: "Zone requise" })
    .int()
    .min(1)
    .max(4),
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().optional(),
});

export type CreateChantierFormData = z.infer<typeof CreateChantierSchema>;
