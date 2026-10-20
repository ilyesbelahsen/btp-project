import { api } from "@/services/api";
import {
  ZoneMajorationListSchema,
  ZoneMajorationSchema,
} from "@/features/zone/schemas";
import type { ZoneMajoration } from "@/features/zone/types";

export const zoneService = {
  findAll: async (): Promise<ZoneMajoration[]> => {
    const { data } = await api.get("/zones-majorations");
    return ZoneMajorationListSchema.parse(data);
  },

  update: async (zoneCategorie: number, tauxMajoration: number) => {
    const { data } = await api.put(`/zones-majorations/${zoneCategorie}`, {
      tauxMajoration,
    });
    return ZoneMajorationSchema.parse({
      zoneCategorie: data.zoneCategorie,
      tauxMajoration: data.tauxMajoration,
      historique: [data],
    });
  },
};
