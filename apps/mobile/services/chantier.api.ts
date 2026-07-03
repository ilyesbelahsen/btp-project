import { apiClient } from "./api-client";

interface Chantier {
  id: string;
  name: string;
  address: string;
  status: "EN_COURS" | "TERMINE" | "EN_PAUSE" | "ANNULE";
  companyId: string;
  startDate: string;
}

export const chantierApi = {
  findAll: () => apiClient.get<Chantier[]>("/chantiers"),
  findOne: (id: string) => apiClient.get<Chantier>(`/chantiers/${id}`),
};
