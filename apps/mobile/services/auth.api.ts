import { apiClient } from "./api-client";

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "PATRON" | "COMPTABLE" | "OUVRIER";
  companyId: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>("/auth/login", { email, password }),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>("/auth/refresh", { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post("/auth/logout", { refreshToken }),
};
