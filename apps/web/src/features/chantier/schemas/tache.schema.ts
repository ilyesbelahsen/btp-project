import { z } from "zod";

function optionalMontantPositif(message: string) {
  return z
    .string()
    .optional()
    .transform((montant) => (montant ? parseFloat(montant) : null))
    .refine(
      (montant) => montant === null || (!Number.isNaN(montant) && montant >= 0),
      {
        message,
      },
    );
}

export const TacheFormSchema = z.object({
  libelle: z.string().min(1, "Le libellé est requis"),
  prixVenduHT: z
    .string()
    .optional()
    .transform((prix) => (prix ? parseFloat(prix) : null))
    .refine((prix) => prix === null || (!Number.isNaN(prix) && prix > 0), {
      message: "Le prix doit être un nombre positif",
    }),
  budgetMainOeuvre: optionalMontantPositif(
    "Le budget main d'œuvre doit être un nombre positif ou nul",
  ),
  budgetMateriaux: optionalMontantPositif(
    "Le budget matériaux doit être un nombre positif ou nul",
  ),
});

export type TacheFormInput = z.input<typeof TacheFormSchema>;
export type TacheFormData = z.output<typeof TacheFormSchema>;
