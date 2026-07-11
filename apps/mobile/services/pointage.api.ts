import { apiClient } from "./api-client";

export interface Pointage {
  id: string;
  userId: string;
  chantierId: string;
  status: "EN_COURS" | "TERMINE" | "VALIDE";
  startTime: string;
  endTime?: string;
  totalHours?: number;
  taches?: string[];
  comment?: string;
  chantier?: { id: string; name: string };
}

export interface HistoriquePage {
  data: Pointage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const pointageApi = {
  getTodayActive: () =>
    apiClient.get<Pointage | null>("/pointages/aujourd-hui"),

  getTypesTaches: () => apiClient.get<string[]>("/pointages/types-taches"),

  getHistorique: (params?: { page?: number; limit?: number; mois?: string }) =>
    apiClient.get<HistoriquePage>("/pointages/mon-historique", { params }),

  getMesStats: (mois?: string) =>
    apiClient.get<{
      totalHeures: number;
      totalJours: number;
      dernierPointage: string | null;
      mois: string;
    }>("/pointages/mes-stats", { params: mois ? { mois } : undefined }),

  saveTaches: (id: string, taches: string[]) =>
    apiClient.post<{ id: string; taches: string[] }>(
      `/pointages/${id}/taches`,
      { taches },
    ),

  start: (chantierId: string) =>
    apiClient.post<Pointage>("/pointages/start", { chantierId }),

  stop: (id: string) => apiClient.patch<Pointage>(`/pointages/${id}/terminer`),

  updateComment: (id: string, comment: string) =>
    apiClient.patch<{ id: string; comment: string }>(`/pointages/${id}`, {
      comment,
    }),
};
