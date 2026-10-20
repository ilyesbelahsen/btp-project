import { api } from "@/services/api";
import { AuthResponseSchema } from "@/features/auth/schemas";
import type { AuthResponse } from "@/features/auth/types";

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/web/login", {
      email,
      password,
    });
    return AuthResponseSchema.parse(data) satisfies AuthResponse;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/web/logout");
  },
};
