import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chantierService } from "@/features/chantier/services/chantier.service";
import { chantierKeys } from "@/features/chantier/query-keys";
import type {
  TacheDevisInput,
  UpdateTacheDto,
} from "@/features/chantier/types";

export function useTachesChantier(chantierId: string) {
  return useQuery({
    queryKey: chantierKeys.taches(chantierId),
    queryFn: () => chantierService.getTaches(chantierId),
    enabled: !!chantierId,
  });
}

export function useSaveTachesBatch(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taches: TacheDevisInput[]) =>
      chantierService.saveTachesBatch(chantierId, taches),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: chantierKeys.taches(chantierId),
      }),
  });
}

export function useAddTache(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: TacheDevisInput) =>
      chantierService.addTache(chantierId, dto),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: chantierKeys.taches(chantierId),
      }),
  });
}

export function useUpdateTache(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tacheId, dto }: { tacheId: string; dto: UpdateTacheDto }) =>
      chantierService.updateTache(chantierId, tacheId, dto),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: chantierKeys.taches(chantierId),
      }),
  });
}

export function useDeleteTache(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tacheId: string) =>
      chantierService.deleteTache(chantierId, tacheId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: chantierKeys.taches(chantierId),
      }),
  });
}
