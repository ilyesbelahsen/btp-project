import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  reportingService,
  type ReportingPeriode,
} from "@/features/rapport/reporting.service";

export const reportingKeys = {
  all: ["rapport", "global"] as const,
  detail: (periode: ReportingPeriode) => [...reportingKeys.all, periode] as const,
};

export function useReporting(periode: ReportingPeriode) {
  return useQuery({
    queryKey: reportingKeys.detail(periode),
    queryFn: () => reportingService.get(periode),
  });
}

export function useUpdateCapitalInitial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportingService.updateCapitalInitial,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reportingKeys.all });
    },
  });
}