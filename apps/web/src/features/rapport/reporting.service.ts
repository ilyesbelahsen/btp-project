import { api } from "@/services/api";
import { ReportingGlobalSchema } from "@/features/rapport/reporting.schemas";
import type { ReportingGlobal } from "@/features/rapport/reporting.types";

export type ReportingPeriode = {
  dateFrom: string;
  dateTo: string;
  chantierId?: string;
};

export const reportingService = {
  get: async (periode: ReportingPeriode): Promise<ReportingGlobal> => {
    const { data } = await api.get("/rapport/global", { params: periode });
    return ReportingGlobalSchema.parse(data);
  },
  updateCapitalInitial: async (capitalInitial: number) => {
    const { data } = await api.patch("/rapport/tresorerie", {
      capitalInitial,
    });
    return data as { capitalInitial: number; updatedAt: string };
  },
};