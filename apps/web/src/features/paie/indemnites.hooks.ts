import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { indemnitesService } from "@/features/paie/indemnites.service";
import type {
  CreateIndemniteAffectationDto,
  CreateIndemniteDto,
  UpdateIndemniteDto,
  UpdateIndemniteAffectationDto,
  IndemniteAffectation,
} from "@/features/paie/indemnites.types";

const indemnitesKeys = {
  all: ["paie", "indemnites"] as const,
  affectations: () => [...indemnitesKeys.all, "affectations"] as const,
};

export function useIndemnites() {
  return useQuery({
    queryKey: indemnitesKeys.all,
    queryFn: indemnitesService.findAll,
  });
}

export function useIndemniteAffectations() {
  return useQuery({
    queryKey: indemnitesKeys.affectations(),
    queryFn: indemnitesService.findAffectations,
  });
}

export function useCreateIndemnite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateIndemniteDto) => indemnitesService.create(dto),
    onSuccess: (created) => {
      queryClient.setQueryData<
        Awaited<ReturnType<typeof indemnitesService.findAll>>
      >(indemnitesKeys.all, (current) =>
        current ? [...current, created] : [created],
      );
      void queryClient.invalidateQueries({ queryKey: indemnitesKeys.all });
    },
  });
}

export function useUpdateIndemnite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateIndemniteDto }) =>
      indemnitesService.update(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: indemnitesKeys.all });
    },
  });
}

export function useCreateIndemniteAffectation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateIndemniteAffectationDto) =>
      indemnitesService.createAffectation(dto),
    onSuccess: (created) => {
      queryClient.setQueryData<IndemniteAffectation[]>(
        indemnitesKeys.affectations(),
        (current) => (current ? [created, ...current] : [created]),
      );
      void queryClient.invalidateQueries({
        queryKey: indemnitesKeys.affectations(),
      });
    },
  });
}

export function useDeleteIndemniteAffectation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: indemnitesService.deleteAffectation,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<IndemniteAffectation[]>(
        indemnitesKeys.affectations(),
        (current) => current?.filter((affectation) => affectation.id !== id),
      );
      void queryClient.invalidateQueries({
        queryKey: indemnitesKeys.affectations(),
      });
    },
  });
}

export function useUpdateIndemniteAffectation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateIndemniteAffectationDto;
    }) => indemnitesService.updateAffectation(id, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData<IndemniteAffectation[]>(
        indemnitesKeys.affectations(),
        (current) =>
          current?.map((affectation) =>
            affectation.id === updated.id ? updated : affectation,
          ),
      );
      void queryClient.invalidateQueries({
        queryKey: indemnitesKeys.affectations(),
      });
    },
  });
}
