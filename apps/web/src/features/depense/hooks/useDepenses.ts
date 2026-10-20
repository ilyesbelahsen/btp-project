import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { depenseService } from "@/features/depense/services/depense.service";
import { chantierKeys } from "@/features/chantier/hooks/useChantiers";
import type {
  ControleDepenseDto,
  CreateDepenseDto,
} from "@/features/depense/types";

export const depenseKeys = {
  all: ["depenses"] as const,
  byChantier: (chantierId: string) =>
    [...depenseKeys.all, "chantier", chantierId] as const,
};

export function useDepensesChantier(chantierId: string) {
  return useQuery({
    queryKey: depenseKeys.byChantier(chantierId),
    queryFn: () => depenseService.findByChantier(chantierId),
    enabled: !!chantierId,
  });
}

export function useCreateDepense(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDepenseDto) => depenseService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: depenseKeys.byChantier(chantierId),
      });
      // CA5 : recalcul immédiat du suivi budgétaire de la tâche concernée
      queryClient.invalidateQueries({
        queryKey: chantierKeys.taches(chantierId),
      });
      // CA4 : recalcul immédiat du dashboard et de la synthèse
      queryClient.invalidateQueries({ queryKey: ["rapport"] });
    },
  });
}

export function useControleDepense(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ControleDepenseDto }) =>
      depenseService.controler(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: depenseKeys.byChantier(chantierId),
      });
      queryClient.invalidateQueries({ queryKey: ["rapport"] });
    },
  });
}

export function useDepenseHistorique(id: string, enabled: boolean) {
  return useQuery({
    queryKey: [...depenseKeys.all, "historique", id] as const,
    queryFn: () => depenseService.historique(id),
    enabled,
  });
}
