import { api } from "@/services/api";
import { z } from "zod";
import type {
  Ouvrier,
  CreateOuvrierDto,
  CreatedOuvrier,
  OuvrierDetail,
} from "@/features/ouvriers/types";

const OuvrierSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  role: z.string(),
  tauxHoraire: z.number().nullable(),
});

const CreatedOuvrierSchema = OuvrierSchema.extend({
  tempPassword: z.string(),
});

const PointageResumeSchema = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string().nullable(),
  totalMinutes: z.number().int().nullable().optional(),
  totalHours: z.number().nullable(),
  status: z.string(),
  taches: z.array(z.string()),
  comment: z.string().nullable(),
  chantier: z.object({ id: z.string(), name: z.string() }),
});

const OuvrierDetailSchema = OuvrierSchema.extend({
  address: z.string().nullable(),
  numeroCv: z.string().nullable(),
  mutuelle: z.string().nullable(),
  contactUrgence: z.string().nullable(),
  createdAt: z.string(),
  chantiers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      status: z.string(),
      startDate: z.string(),
      endDate: z.string().nullable(),
    }),
  ),
  pointages: z.array(PointageResumeSchema),
});

export const ouvriersService = {
  findAll: async (): Promise<Ouvrier[]> => {
    const { data } = await api.get("/users/ouvriers");
    return z.array(OuvrierSchema).parse(data);
  },

  create: async (dto: CreateOuvrierDto): Promise<CreatedOuvrier> => {
    const { data } = await api.post("/users/ouvriers", dto);
    return CreatedOuvrierSchema.parse(data);
  },

  findOne: async (id: string): Promise<OuvrierDetail> => {
    const { data } = await api.get(`/users/ouvriers/${id}`);
    return OuvrierDetailSchema.parse(data);
  },
};
