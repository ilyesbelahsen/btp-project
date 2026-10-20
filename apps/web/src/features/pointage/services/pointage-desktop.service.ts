import { api } from "@/services/api";
import { z } from "zod";
import type {
  PointageDesktop,
  PointageFiltres,
  CorrigerPointageDto,
  RejeterPointageDto,
} from "@/features/pointage/types";

const PointageDesktopSchema = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string().nullable(),
  totalMinutes: z.number().int().nullable().optional(),
  totalHours: z.number().nullable(),
  status: z.enum(["EN_COURS", "TERMINE", "SOUMIS", "REJETE", "VALIDE"]),
  taches: z.array(z.string()),
  comment: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  correctedAt: z.string().nullable(),
  correctedById: z.string().nullable(),
  user: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  chantier: z.object({ id: z.string(), name: z.string() }),
});

export const pointageDesktopService = {
  findAll: async (filtres: PointageFiltres): Promise<PointageDesktop[]> => {
    const params = Object.fromEntries(
      Object.entries(filtres).filter(([, v]) => v !== "" && v !== undefined),
    );
    const { data } = await api.get("/pointages", { params });
    return z.array(PointageDesktopSchema).parse(data);
  },

  corriger: async (
    id: string,
    dto: CorrigerPointageDto,
  ): Promise<PointageDesktop> => {
    const { data } = await api.patch(`/pointages/${id}/corriger`, dto);
    return PointageDesktopSchema.parse(data);
  },

  valider: async (id: string): Promise<PointageDesktop> => {
    const { data } = await api.patch(`/pointages/${id}/valider`);
    return PointageDesktopSchema.parse(data);
  },

  rejeter: async (
    id: string,
    dto: RejeterPointageDto,
  ): Promise<PointageDesktop> => {
    const { data } = await api.patch(`/pointages/${id}/rejeter`, dto);
    return PointageDesktopSchema.parse(data);
  },

  validerBatch: async (ids: string[]): Promise<{ validated: number }> => {
    const { data } = await api.post("/pointages/valider-batch", { ids });
    return z.object({ validated: z.number() }).parse(data);
  },
};
