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
  findMyChantiers: () => apiClient.get<Chantier[]>("/chantiers/mes-chantiers"),
  findOne: (id: string) => apiClient.get<Chantier>(`/chantiers/${id}`),
};
