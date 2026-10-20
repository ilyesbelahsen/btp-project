import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zoneService } from "@/features/zone/services/zone.service";

const zoneKeys = {
  all: ["zones-majorations"] as const,
};

export function useZoneMajorations() {
  return useQuery({
    queryKey: zoneKeys.all,
    queryFn: zoneService.findAll,
  });
}

export function useUpdateZoneMajoration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      zoneCategorie,
      tauxMajoration,
    }: {
      zoneCategorie: number;
      tauxMajoration: number;
    }) => zoneService.update(zoneCategorie, tauxMajoration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneKeys.all });
    },
  });
}
