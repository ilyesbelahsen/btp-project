import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paieService } from "@/features/paie/services/paie.service";
import type { PeriodePaie } from "@/features/paie/types";

export const paieKeys = {
  all: ["paie"] as const,
  preview: (periode: PeriodePaie) =>
    [...paieKeys.all, "preview", periode] as const,
  export: (periode: PeriodePaie) =>
    [...paieKeys.all, "export", periode] as const,
};

export function usePaiePreview(periode: PeriodePaie) {
  return useQuery({
    queryKey: paieKeys.preview(periode),
    queryFn: () => paieService.getPreview(periode),
    enabled: !!periode.dateFrom && !!periode.dateTo,
  });
}

export function usePaieExport(periode: PeriodePaie) {
  return useMutation({
    mutationFn: () => paieService.getExport(periode),
  });
}

export function useCreatePaieCorrection(periode: PeriodePaie) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paieService.createCorrection,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: paieKeys.preview(periode),
      });
    },
  });
}

export function useValidatePaieCorrection(periode: PeriodePaie) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paieService.validateCorrection,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: paieKeys.preview(periode),
      });
    },
  });
}
