import { useQuery } from "@tanstack/react-query";
import { rapportService } from "@/features/rapport/services/rapport.service";

export const rapportKeys = {
  dashboard: () => ["rapport", "dashboard"] as const,
  chantiersSynthese: () => ["rapport", "chantiers-synthese"] as const,
  indicateursChantier: (id: string) => ["rapport", "chantier", id] as const,
  suiviTaches: (id: string) => ["rapport", "chantier", id, "taches"] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: rapportKeys.dashboard(),
    queryFn: rapportService.getDashboardStats,
  });
}

export function useChantiersSynthese() {
  return useQuery({
    queryKey: rapportKeys.chantiersSynthese(),
    queryFn: rapportService.getChantiersSynthese,
  });
}

export function useIndicateursChantier(chantierId: string) {
  return useQuery({
    queryKey: rapportKeys.indicateursChantier(chantierId),
    queryFn: () => rapportService.getIndicateursChantier(chantierId),
    enabled: !!chantierId,
  });
}

export function useSuiviTachesChantier(chantierId: string) {
  return useQuery({
    queryKey: rapportKeys.suiviTaches(chantierId),
    queryFn: () => rapportService.getSuiviTachesChantier(chantierId),
    enabled: !!chantierId,
  });
}
