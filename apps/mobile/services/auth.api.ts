import { apiClient } from "./api-client";

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "ADMIN" | "PATRON" | "COMPTABLE" | "OUVRIER";
        companyId: string;
      };
      accessToken: string;
    }>("/auth/login", { email, password }),
  logout: () => apiClient.post("/auth/logout"),
};
