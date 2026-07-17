import { z } from "zod";
import { CHANTIER_STATUSES } from "@/src/types/chantier.type";

export const ChantierSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  status: z.enum(CHANTIER_STATUSES),
  companyId: z.string(),
  startDate: z.string(),
});

export const ChantierListSchema = z.array(ChantierSchema);
