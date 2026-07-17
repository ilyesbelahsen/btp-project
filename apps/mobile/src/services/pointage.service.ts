import { api } from "@/src/api/axios";
import {
  HistoriquePageSchema,
  PointageSchema,
  PointageStatsSchema,
} from "@/src/schemas/pointage.schema";
import type {
  HistoriquePage,
  Pointage,
  PointageStats,
} from "@/src/types/pointage.type";

export const pointageService = {
  getTodayActive: async (): Promise<Pointage | null> => {
    const response = await api.get("/pointages/aujourd-hui");
    if (!response.data) return null;
    return PointageSchema.parse(response.data);
  },

  getTypesTaches: async (): Promise<string[]> => {
    const response = await api.get("/pointages/types-taches");
    return response.data as string[];
  },

  getHistorique: async (params?: {
    page?: number;
    limit?: number;
    mois?: string;
  }): Promise<HistoriquePage> => {
    const response = await api.get("/pointages/mon-historique", { params });
    return HistoriquePageSchema.parse(response.data);
  },

  getMesStats: async (mois?: string): Promise<PointageStats> => {
    const response = await api.get("/pointages/mes-stats", {
      params: mois ? { mois } : undefined,
    });
    return PointageStatsSchema.parse(response.data);
  },

  start: async (chantierId: string): Promise<Pointage> => {
    const response = await api.post("/pointages/start", { chantierId });
    return PointageSchema.parse(response.data);
  },

  stop: async (id: string): Promise<Pointage> => {
    const response = await api.patch(`/pointages/${id}/terminer`);
    return PointageSchema.parse(response.data);
  },

  saveTaches: async (id: string, taches: string[]): Promise<void> => {
    await api.post(`/pointages/${id}/taches`, { taches });
  },

  updateComment: async (id: string, comment: string): Promise<void> => {
    await api.patch(`/pointages/${id}`, { comment });
  },
};
