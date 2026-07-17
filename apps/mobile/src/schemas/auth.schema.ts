import { z } from "zod";
import { USER_ROLES } from "@/src/types/auth.type";

export const LoginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(USER_ROLES),
  companyId: z.string(),
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: AuthUserSchema,
});
