import { api } from "@/src/api/axios";
import { AuthResponseSchema } from "@/src/schemas/auth.schema";
import type { AuthResponse } from "@/src/types/auth.type";

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", { email, password });
    return AuthResponseSchema.parse(response.data);
  },

  logout: (refreshToken: string): Promise<void> =>
    api.post("/auth/logout", { refreshToken }),

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post("/auth/refresh", { refreshToken });
    return AuthResponseSchema.parse(response.data);
  },
};
