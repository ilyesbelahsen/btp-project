import { api } from "@/services/api";
import {
  DashboardStatsSchema,
  ChantierSyntheseListSchema,
  IndicateursChantierSchema,
  SuiviTachesListSchema,
} from "@/features/rapport/schemas";
import type {
  DashboardStats,
  ChantierSynthese,
  IndicateursChantier,
  SuiviTache,
} from "@/features/rapport/types";

export const rapportService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get("/rapport/dashboard");
    return DashboardStatsSchema.parse(data);
  },

  getChantiersSynthese: async (): Promise<ChantierSynthese[]> => {
    const { data } = await api.get("/rapport/chantiers-synthese");
    return ChantierSyntheseListSchema.parse(data);
  },

  getIndicateursChantier: async (
    chantierId: string,
  ): Promise<IndicateursChantier> => {
    const { data } = await api.get(`/rapport/chantier/${chantierId}`);
    return IndicateursChantierSchema.parse(data);
  },

  getSuiviTachesChantier: async (chantierId: string): Promise<SuiviTache[]> => {
    const { data } = await api.get(`/rapport/chantier/${chantierId}/taches`);
    return SuiviTachesListSchema.parse(data);
  },
};
