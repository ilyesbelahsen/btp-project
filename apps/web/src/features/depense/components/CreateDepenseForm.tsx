"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useCreateDepense } from "@/features/depense/hooks/useDepenses";
import {
  CreateDepenseSchema,
  type CreateDepenseFormData,
  type CreateDepenseFormInput,
} from "@/features/depense/schemas";
import {
  DEPENSE_CATEGORIE_LABELS,
  DEPENSE_CATEGORIE_SAISIE,
} from "@/features/depense/types";
import { useTachesChantier } from "@/features/chantier/hooks/useChantiers";

export function CreateDepenseForm({ chantierId }: { chantierId: string }) {
  const mutation = useCreateDepense(chantierId);
  const { data: taches, isLoading } = useTachesChantier(chantierId);
  const defaultValues = {
    categorie: "MATERIEL",
    tacheId: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    fournisseur: "",
  } as const;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDepenseFormInput, unknown, CreateDepenseFormData>({
    resolver: zodResolver(CreateDepenseSchema),
    defaultValues,
  });
  const noTask = !isLoading && (taches?.length ?? 0) === 0;

  async function submit(input: CreateDepenseFormData) {
    await mutation.mutateAsync({
      chantierId,
      tacheId: input.tacheId,
      categorie: input.categorie,
      montant: Number(input.montant),
      date: input.date,
      description: input.description,
      fournisseur: input.fournisseur,
    });
    reset(defaultValues);
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <PlusCircle className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Nouvelle dépense</span>
      </div>
      {noTask && (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Ce chantier n&apos;a aucune tâche. Ajoutez d&apos;abord une tâche pour
          pouvoir y rattacher une dépense.
        </p>
      )}
      {mutation.isError && (
        <p className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          Impossible d&apos;enregistrer la dépense.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <Label htmlFor="depense-tache" className="text-xs">
            Tâche *
          </Label>
          <Select id="depense-tache" disabled={noTask} {...register("tacheId")}>
            <option value="">Sélectionner une tâche</option>
            {taches?.map((tache) => (
              <option key={tache.id} value={tache.id}>
                {tache.libelle}
              </option>
            ))}
          </Select>
          {errors.tacheId && (
            <p className="text-xs text-destructive">{errors.tacheId.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="depense-categorie" className="text-xs">
            Catégorie
          </Label>
          <Select id="depense-categorie" {...register("categorie")}>
            {DEPENSE_CATEGORIE_SAISIE.map((value) => (
              <option key={value} value={value}>
                {DEPENSE_CATEGORIE_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="depense-fournisseur" className="text-xs">
            Fournisseur (optionnel)
          </Label>
          <Input id="depense-fournisseur" {...register("fournisseur")} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="depense-montant" className="text-xs">
            Montant HT (€) *
          </Label>
          <Input
            id="depense-montant"
            type="number"
            step="0.01"
            min="0.01"
            {...register("montant")}
          />
          {errors.montant && (
            <p className="text-xs text-destructive">{errors.montant.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="depense-date" className="text-xs">
            Date *
          </Label>
          <Input id="depense-date" type="date" {...register("date")} />
          {errors.date && (
            <p className="text-xs text-destructive">{errors.date.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <Label htmlFor="depense-description" className="text-xs">
            Description (optionnel)
          </Label>
          <Input id="depense-description" {...register("description")} />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit" size="sm" disabled={mutation.isPending || noTask}>
          {mutation.isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
