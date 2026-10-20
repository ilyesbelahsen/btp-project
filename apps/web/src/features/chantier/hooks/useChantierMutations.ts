import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chantierService } from "@/features/chantier/services/chantier.service";
import { chantierKeys } from "@/features/chantier/query-keys";
import type {
  CreateChantierDto,
  UpdateChantierDto,
} from "@/features/chantier/types";

function invalidateChantiers(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: chantierKeys.list() });
  queryClient.invalidateQueries({ queryKey: ["rapport"] });
}

export function useCreateChantier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateChantierDto) => chantierService.create(dto),
    onSuccess: () => invalidateChantiers(queryClient),
  });
}

export function useTerminerChantier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chantierId: string) => chantierService.terminer(chantierId),
    onSuccess: () => invalidateChantiers(queryClient),
  });
}

export function useUpdateChantier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateChantierDto }) =>
      chantierService.update(id, dto),
    onSuccess: () => invalidateChantiers(queryClient),
  });
}

export function useDeleteChantier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chantierId: string) => chantierService.remove(chantierId),
    onSuccess: () => invalidateChantiers(queryClient),
  });
}
