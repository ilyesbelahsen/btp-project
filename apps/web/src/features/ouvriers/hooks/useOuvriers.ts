import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ouvriersService } from "@/features/ouvriers/services/ouvriers.service";
import type { CreateOuvrierDto } from "@/features/ouvriers/types";

export const ouvrierKeys = {
  all: ["ouvriers"] as const,
  list: () => [...ouvrierKeys.all, "list"] as const,
  detail: (id: string) => [...ouvrierKeys.all, "detail", id] as const,
};

export function useOuvriers() {
  return useQuery({
    queryKey: ouvrierKeys.list(),
    queryFn: ouvriersService.findAll,
  });
}

export function useCreateOuvrier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOuvrierDto) => ouvriersService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ouvrierKeys.list() });
    },
  });
}

export function useOuvrierDetail(id: string) {
  return useQuery({
    queryKey: ouvrierKeys.detail(id),
    queryFn: () => ouvriersService.findOne(id),
    enabled: !!id,
  });
}
