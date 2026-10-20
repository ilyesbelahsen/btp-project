import { useQuery } from "@tanstack/react-query";
import { chantierService } from "@/features/chantier/services/chantier.service";
import { chantierKeys } from "@/features/chantier/query-keys";
import { useAuthStore } from "@/stores/auth.store";

export function useChantiers() {
  const role = useAuthStore((state) => state.user?.role);
  return useQuery({
    queryKey: [...chantierKeys.list(), role] as const,
    queryFn:
      role === "CONDUCTEUR"
        ? chantierService.findAssigned
        : chantierService.findAll,
    enabled: role !== undefined,
  });
}

export function useChantier(chantierId: string) {
  return useQuery({
    queryKey: chantierKeys.detail(chantierId),
    queryFn: () => chantierService.getById(chantierId),
    enabled: !!chantierId,
  });
}
