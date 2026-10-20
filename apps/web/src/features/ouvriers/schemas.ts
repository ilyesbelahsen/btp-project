import { z } from "zod";

export const CreateOuvrierSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  tauxHoraire: z
    .string()
    .min(1, "Le taux horaire est requis")
    .transform((v) => parseFloat(v))
    .refine((v) => !isNaN(v) && v > 0, {
      message: "Le taux horaire doit être un nombre positif",
    }),
  phone: z.string().optional(),
  address: z.string().optional(),
  numeroCv: z.string().optional(),
  mutuelle: z.string().optional(),
  contactUrgence: z.string().optional(),
});

export type CreateOuvrierFormInput = z.input<typeof CreateOuvrierSchema>;
export type CreateOuvrierFormData = z.output<typeof CreateOuvrierSchema>;
