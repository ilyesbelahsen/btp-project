import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.enum(["ADMIN", "PATRON", "COMPTABLE", "CONDUCTEUR", "OUVRIER"]),
    companyId: z.string(),
  }),
});
