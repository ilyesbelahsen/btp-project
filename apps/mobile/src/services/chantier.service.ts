import { api } from "@/src/api/axios";
import {
  ChantierListSchema,
  ChantierSchema,
  TacheChantierListSchema,
} from "@/src/schemas/chantier.schema";
import type { Chantier, TacheChantier } from "@/src/types/chantier.type";

export const chantierService = {
  findMyChantiers: async (): Promise<Chantier[]> => {
    const response = await api.get("/chantiers/mes-chantiers");
    return ChantierListSchema.parse(response.data);
  },

  findOne: async (id: string): Promise<Chantier> => {
    const response = await api.get(`/chantiers/${id}`);
    return ChantierSchema.parse(response.data);
  },

  findTaches: async (chantierId: string): Promise<TacheChantier[]> => {
    const response = await api.get(`/chantiers/${chantierId}/taches`);
    return TacheChantierListSchema.parse(response.data);
  },
};
