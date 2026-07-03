import { apiClient } from "./api-client";

interface Pointage {
  id: string;
  userId: string;
  chantierId: string;
  status: "EN_COURS" | "TERMINE" | "VALIDE";
  startTime: string;
  endTime?: string;
  totalHours?: number;
  comment?: string;
}

export const pointageApi = {
  findAll: () => apiClient.get<Pointage[]>("/pointages"),
  start: (chantierId: string) =>
    apiClient.post<Pointage>("/pointages/start", { chantierId }),
  stop: (id: string, comment?: string) =>
    apiClient.patch<Pointage>(`/pointages/${id}/stop`, { comment }),
};
