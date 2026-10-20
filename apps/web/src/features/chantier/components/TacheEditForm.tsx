"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { useUpdateTache } from "@/features/chantier/hooks/useChantiers";
import {
  TacheFormSchema,
  type TacheFormData,
  type TacheFormInput,
} from "@/features/chantier/schemas/tache.schema";
import type { TacheChantier } from "@/features/chantier/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function toFormValues(tache: TacheChantier): TacheFormInput {
  return {
    libelle: tache.libelle,
    prixVenduHT: tache.prixVenduHT?.toString() ?? "",
    budgetMainOeuvre: tache.budgetMainOeuvre?.toString() ?? "",
    budgetMateriaux: tache.budgetMateriaux?.toString() ?? "",
  };
}

export function TacheEditForm({
  tache,
  chantierId,
  onCancel,
}: {
  tache: TacheChantier;
  chantierId: string;
  onCancel: () => void;
}) {
  const mutation = useUpdateTache(chantierId);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TacheFormInput, unknown, TacheFormData>({
    resolver: zodResolver(TacheFormSchema),
    defaultValues: toFormValues(tache),
  });

  function save(task: TacheFormData) {
    mutation.mutate({ tacheId: tache.id, dto: task }, { onSuccess: onCancel });
  }

  return (
    <form
      onSubmit={handleSubmit(save)}
      className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3"
    >
      <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex-1">
          <Input
            {...register("libelle")}
            placeholder="Libellé de la tâche"
            className="h-8 text-sm"
          />
          {errors.libelle && (
            <p className="mt-0.5 text-xs text-destructive">
              {errors.libelle.message}
            </p>
          )}
        </div>
        {(["prixVenduHT", "budgetMainOeuvre", "budgetMateriaux"] as const).map(
          (field) => (
            <div key={field} className="w-full sm:w-36">
              <Input
                {...register(field)}
                type="number"
                step="0.01"
                min="0"
                className="h-8 text-sm"
              />
              {errors[field] && (
                <p className="mt-0.5 text-xs text-destructive">
                  {errors[field]?.message}
                </p>
              )}
            </div>
          ),
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="submit"
          size="icon"
          className="h-8 w-8"
          disabled={mutation.isPending}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
