import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chantierService } from "@/features/chantier/services/chantier.service";
import { chantierKeys } from "@/features/chantier/query-keys";

export function useOuvriersChantier(chantierId: string) {
  return useQuery({
    queryKey: chantierKeys.ouvriers(chantierId),
    queryFn: () => chantierService.getOuvriersAffectes(chantierId),
    enabled: !!chantierId,
  });
}

export function useAssignOuvrier(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      chantierService.assignOuvrier(chantierId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: chantierKeys.ouvriers(chantierId),
      }),
  });
}

export function useRemoveOuvrier(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      chantierService.removeOuvrier(chantierId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: chantierKeys.ouvriers(chantierId),
      }),
  });
}
