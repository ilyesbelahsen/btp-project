"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useAddTache } from "@/features/chantier/hooks/useChantiers";
import {
  TacheFormSchema,
  type TacheFormData,
  type TacheFormInput,
} from "@/features/chantier/schemas/tache.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AddTacheFormProps = {
  chantierId: string;
};

export function AddTacheForm({ chantierId }: AddTacheFormProps) {
  const addMutation = useAddTache(chantierId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TacheFormInput, unknown, TacheFormData>({
    resolver: zodResolver(TacheFormSchema),
    defaultValues: {
      libelle: "",
      prixVenduHT: "",
      budgetMainOeuvre: "",
      budgetMateriaux: "",
    },
  });

  function addTask(task: TacheFormData) {
    addMutation.mutate(task, { onSuccess: () => reset() });
  }

  return (
    <form
      onSubmit={handleSubmit(addTask)}
      className="flex items-start gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4"
    >
      <Plus className="mt-2 h-4 w-4 shrink-0 text-primary" />
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:flex-wrap">
        <div className="flex-1 basis-full sm:basis-auto">
          <Label htmlFor="new-libelle" className="sr-only">
            Libellé
          </Label>
          <Input
            id="new-libelle"
            {...register("libelle")}
            placeholder="Libellé de la nouvelle tâche…"
            className="h-9"
          />
          {errors.libelle && (
            <p className="mt-1 text-xs text-destructive">
              {errors.libelle.message}
            </p>
          )}
        </div>
        <div className="w-40">
          <Label htmlFor="new-prix" className="sr-only">
            Prix HT
          </Label>
          <Input
            id="new-prix"
            {...register("prixVenduHT")}
            type="number"
            step="0.01"
            min="0"
            placeholder="Prix HT (€)"
            className="h-9"
          />
          {errors.prixVenduHT && (
            <p className="mt-1 text-xs text-destructive">
              {errors.prixVenduHT.message}
            </p>
          )}
        </div>
        <div className="w-40">
          <Label htmlFor="new-budget-mo" className="sr-only">
            Budget main d&apos;œuvre
          </Label>
          <Input
            id="new-budget-mo"
            {...register("budgetMainOeuvre")}
            type="number"
            step="0.01"
            min="0"
            placeholder="Budget MO (€)"
            className="h-9"
          />
          {errors.budgetMainOeuvre && (
            <p className="mt-1 text-xs text-destructive">
              {errors.budgetMainOeuvre.message}
            </p>
          )}
        </div>
        <div className="w-40">
          <Label htmlFor="new-budget-materiaux" className="sr-only">
            Budget matériaux
          </Label>
          <Input
            id="new-budget-materiaux"
            {...register("budgetMateriaux")}
            type="number"
            step="0.01"
            min="0"
            placeholder="Budget matériaux (€)"
            className="h-9"
          />
          {errors.budgetMateriaux && (
            <p className="mt-1 text-xs text-destructive">
              {errors.budgetMateriaux.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="h-9 shrink-0"
          disabled={addMutation.isPending}
        >
          {addMutation.isPending ? "Ajout…" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}
