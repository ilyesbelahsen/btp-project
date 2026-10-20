import { z } from "zod";

export const CreateDepenseSchema = z.object({
  categorie: z.enum(["MATERIEL", "MAIN_OEUVRE", "SOUS_TRAITANCE"], {
    required_error: "La catégorie est requise",
  }),
  tacheId: z.string().trim().min(1, "La tâche est requise"),
  montant: z
    .string()
    .min(1, "Le montant est requis")
    .transform((v) => parseFloat(v))
    .refine((v) => !isNaN(v) && v > 0, {
      message: "Le montant doit être un nombre positif",
    }),
  date: z
    .string()
    .min(1, "La date est requise")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "La date est invalide",
    }),
  description: z
    .string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .optional(),
  fournisseur: z
    .string()
    .max(200, "Le fournisseur ne peut pas dépasser 200 caractères")
    .optional(),
});

export type CreateDepenseFormInput = z.input<typeof CreateDepenseSchema>;
export type CreateDepenseFormData = z.output<typeof CreateDepenseSchema>;
