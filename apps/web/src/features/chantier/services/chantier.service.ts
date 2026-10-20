import { api } from "@/services/api";
import { z } from "zod";
import {
  ChantierListSchema,
  ChantierSchema,
} from "@/features/chantier/schemas";
import type {
  Chantier,
  CreateChantierDto,
  OuvrierAffecte,
  TacheChantier,
  TacheDevisInput,
  UpdateChantierDto,
  UpdateTacheDto,
} from "@/features/chantier/types";

const TacheSchema = z.object({
  id: z.string(),
  chantierId: z.string(),
  libelle: z.string(),
  prixVenduHT: z.number().nullable(),
  budgetMainOeuvre: z.number().nullable(),
  budgetMateriaux: z.number().nullable(),
  createdAt: z.string(),
});

export const chantierService = {
  getById: async (chantierId: string): Promise<Chantier> => {
    const { data } = await api.get(`/chantiers/${chantierId}`);
    return ChantierSchema.parse(data);
  },

  findAll: async (): Promise<Chantier[]> => {
    const { data } = await api.get("/chantiers");
    return ChantierListSchema.parse(data);
  },

  findAssigned: async (): Promise<Chantier[]> => {
    const { data } = await api.get("/chantiers/mes-chantiers");
    return ChantierListSchema.parse(data);
  },

  create: async (dto: CreateChantierDto): Promise<Chantier> => {
    const { data } = await api.post("/chantiers", dto);
    return ChantierSchema.parse(data);
  },

  terminer: async (chantierId: string): Promise<Chantier> => {
    const { data } = await api.patch(`/chantiers/${chantierId}/terminer`);
    return ChantierSchema.parse(data);
  },

  update: async (
    chantierId: string,
    dto: UpdateChantierDto,
  ): Promise<Chantier> => {
    const { data } = await api.patch(`/chantiers/${chantierId}`, dto);
    return ChantierSchema.parse(data);
  },

  remove: async (chantierId: string): Promise<void> => {
    await api.delete(`/chantiers/${chantierId}`);
  },

  getTaches: async (chantierId: string): Promise<TacheChantier[]> => {
    const { data } = await api.get(`/chantiers/${chantierId}/taches`);
    return z.array(TacheSchema).parse(data);
  },

  saveTachesBatch: async (
    chantierId: string,
    taches: TacheDevisInput[],
  ): Promise<void> => {
    await api.post(`/chantiers/${chantierId}/taches/batch`, { taches });
  },

  addTache: async (
    chantierId: string,
    dto: TacheDevisInput,
  ): Promise<TacheChantier> => {
    const { data } = await api.post(`/chantiers/${chantierId}/taches`, dto);
    return TacheSchema.parse(data);
  },

  updateTache: async (
    chantierId: string,
    tacheId: string,
    dto: UpdateTacheDto,
  ): Promise<TacheChantier> => {
    const { data } = await api.patch(
      `/chantiers/${chantierId}/taches/${tacheId}`,
      dto,
    );
    return TacheSchema.parse(data);
  },

  deleteTache: async (chantierId: string, tacheId: string): Promise<void> => {
    await api.delete(`/chantiers/${chantierId}/taches/${tacheId}`);
  },

  getOuvriersAffectes: async (
    chantierId: string,
  ): Promise<OuvrierAffecte[]> => {
    const { data } = await api.get(`/chantiers/${chantierId}/ouvriers`);
    return z
      .array(
        z.object({
          id: z.string(),
          firstName: z.string(),
          lastName: z.string(),
          email: z.string(),
          role: z.string(),
        }),
      )
      .parse(data);
  },

  assignOuvrier: async (chantierId: string, userId: string): Promise<void> => {
    await api.post(`/chantiers/${chantierId}/ouvriers/${userId}`);
  },

  removeOuvrier: async (chantierId: string, userId: string): Promise<void> => {
    await api.delete(`/chantiers/${chantierId}/ouvriers/${userId}`);
  },
};
