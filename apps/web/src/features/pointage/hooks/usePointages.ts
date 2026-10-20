import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pointageDesktopService } from "@/features/pointage/services/pointage-desktop.service";
import type {
  PointageFiltres,
  CorrigerPointageDto,
} from "@/features/pointage/types";

export const pointageKeys = {
  all: ["pointages-desktop"] as const,
  list: (filtres: PointageFiltres) =>
    [...pointageKeys.all, "list", filtres] as const,
};

export function usePointagesDesktop(filtres: PointageFiltres) {
  return useQuery({
    queryKey: pointageKeys.list(filtres),
    queryFn: () => pointageDesktopService.findAll(filtres),
  });
}

export function useCorrigerPointage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CorrigerPointageDto }) =>
      pointageDesktopService.corriger(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointageKeys.all });
    },
  });
}

export function useValiderPointage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pointageDesktopService.valider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointageKeys.all });
      // CA4 : recalcul immédiat des indicateurs budgétaires (BR-C-013)
      queryClient.invalidateQueries({ queryKey: ["rapport"] });
    },
  });
}

export function useValiderBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => pointageDesktopService.validerBatch(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointageKeys.all });
      // CA4 : recalcul immédiat des indicateurs budgétaires (BR-C-013)
      queryClient.invalidateQueries({ queryKey: ["rapport"] });
    },
  });
}

export function useRejeterPointage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      pointageDesktopService.rejeter(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointageKeys.all });
    },
  });
}
