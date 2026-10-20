import { z } from "zod";
import { api } from "@/services/api";
import type {
  CreateIndemniteAffectationDto,
  CreateIndemniteDto,
  Indemnite,
  IndemniteAffectation,
  UpdateIndemniteDto,
  UpdateIndemniteAffectationDto,
} from "@/features/paie/indemnites.types";

const IndemniteSchema = z.object({
  id: z.string(),
  libelle: z.string(),
  montant: z.number().nullable(),
  regle: z.string().nullable(),
  actif: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const AffectationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  dateFrom: z.string(),
  dateTo: z.string(),
  quantite: z.number(),
  note: z.string().nullable(),
  indemnite: IndemniteSchema,
  user: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  createdBy: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
});

export const indemnitesService = {
  async findAll(): Promise<Indemnite[]> {
    const { data } = await api.get("/paie/indemnites");
    return z.array(IndemniteSchema).parse(data);
  },
  async create(dto: CreateIndemniteDto): Promise<Indemnite> {
    const { data } = await api.post("/paie/indemnites", dto);
    return IndemniteSchema.parse(data);
  },
  async update(id: string, dto: UpdateIndemniteDto): Promise<Indemnite> {
    const { data } = await api.patch(`/paie/indemnites/${id}`, dto);
    return IndemniteSchema.parse(data);
  },
  async findAffectations(): Promise<IndemniteAffectation[]> {
    const { data } = await api.get("/paie/indemnites/affectations");
    return z.array(AffectationSchema).parse(data);
  },
  async createAffectation(
    dto: CreateIndemniteAffectationDto,
  ): Promise<IndemniteAffectation> {
    const { data } = await api.post("/paie/indemnites/affectations", dto);
    return AffectationSchema.parse(data);
  },
  async updateAffectation(
    id: string,
    dto: UpdateIndemniteAffectationDto,
  ): Promise<IndemniteAffectation> {
    const { data } = await api.patch(
      `/paie/indemnites/affectations/${id}`,
      dto,
    );
    return AffectationSchema.parse(data);
  },
  async deleteAffectation(id: string) {
    await api.patch(`/paie/indemnites/affectations/${id}/supprimer`);
  },
};
