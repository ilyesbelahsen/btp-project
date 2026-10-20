"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  CreateChantierSchema,
  type CreateChantierFormData,
} from "@/features/chantier/schemas";
import { useCreateChantier } from "@/features/chantier/hooks/useChantiers";

type ApiError = {
  response?: { data?: { message?: string } };
};

export function CreateChantierForm() {
  const router = useRouter();
  const mutation = useCreateChantier();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateChantierFormData>({
    resolver: zodResolver(CreateChantierSchema),
    defaultValues: { zoneCategorie: 1 },
  });

  // US-001 : marge visée = prix de vente - (budget total × coefficient)
  // calculés côté API mais prévisualisés ici
  const budgetMainOeuvreSaisi = watch("budgetMainOeuvre");
  const budgetMateriauxSaisi = watch("budgetMateriaux");
  const coefficientSaisi = watch("coefficient");
  const prixVenteSaisi = watch("prixVenteHT");
  const budgetTotalEstime =
    (Number(budgetMainOeuvreSaisi) || 0) + (Number(budgetMateriauxSaisi) || 0);
  const margeEstimee =
    (Number(prixVenteSaisi) || 0) -
    budgetTotalEstime * (Number(coefficientSaisi) || 0);

  const onSubmit = (data: CreateChantierFormData) => {
    mutation.mutate(
      {
        ...data,
        budgetMainOeuvre: Number(data.budgetMainOeuvre),
        budgetMateriaux: Number(data.budgetMateriaux),
        coefficient: Number(data.coefficient),
        zoneCategorie: Number(data.zoneCategorie),
        endDate: data.endDate || undefined,
      },
      {
        onSuccess: () => router.push("/dashboard/chantiers"),
        onError: (err: unknown) => {
          const apiError = err as ApiError;
          console.error(apiError.response?.data?.message);
        },
      },
    );
  };

  const isPending = isSubmitting || mutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-7">
      {mutation.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
          Une erreur est survenue. Vérifiez les informations saisies.
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="border-b border-stone-200 pb-2">
          <h2 className="text-sm font-semibold text-stone-900">
            Identification du chantier
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Les informations principales du projet.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom du chantier *</Label>
            <Input
              id="name"
              placeholder="Résidence Les Cèdres"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="client">Client *</Label>
            <Input
              id="client"
              placeholder="Nom du client"
              aria-invalid={!!errors.client}
              {...register("client")}
            />
            {errors.client ? (
              <p className="text-xs text-destructive">
                {errors.client.message}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="border-b border-stone-200 pb-2">
          <h2 className="text-sm font-semibold text-stone-900">
            Budget prévisionnel
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Répartition des coûts et marge cible.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address">Adresse *</Label>
          <Input
            id="address"
            placeholder="12 rue des Cèdres, 75001 Paris"
            aria-invalid={!!errors.address}
            {...register("address")}
          />
          {errors.address ? (
            <p className="text-xs text-destructive">{errors.address.message}</p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="budgetMainOeuvre">
              Budget main d&apos;œuvre HT (€) *
            </Label>
            <Input
              id="budgetMainOeuvre"
              type="number"
              min={0}
              step={100}
              placeholder="210000"
              aria-invalid={!!errors.budgetMainOeuvre}
              {...register("budgetMainOeuvre", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              Interne + sous-traitance
            </p>
            {errors.budgetMainOeuvre ? (
              <p className="text-xs text-destructive">
                {errors.budgetMainOeuvre.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="budgetMateriaux">Budget matériaux HT (€) *</Label>
            <Input
              id="budgetMateriaux"
              type="number"
              min={0}
              step={100}
              placeholder="180000"
              aria-invalid={!!errors.budgetMateriaux}
              {...register("budgetMateriaux", { valueAsNumber: true })}
            />
            {errors.budgetMateriaux ? (
              <p className="text-xs text-destructive">
                {errors.budgetMateriaux.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prixVenteHT">Prix de vente HT (€) *</Label>
          <Input
            id="prixVenteHT"
            type="number"
            min={0}
            step={100}
            placeholder="528000"
            aria-invalid={!!errors.prixVenteHT}
            {...register("prixVenteHT", { valueAsNumber: true })}
          />
          {errors.prixVenteHT ? (
            <p className="text-xs text-destructive">
              {errors.prixVenteHT.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="coefficient">Coefficient de calcul *</Label>
          <Input
            id="coefficient"
            type="number"
            min={0.01}
            step="0.01"
            placeholder="1.20"
            aria-invalid={!!errors.coefficient}
            {...register("coefficient", { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground">
            Appliqué au budget total pour calculer la marge visée.
          </p>
          {errors.coefficient ? (
            <p className="text-xs text-destructive">
              {errors.coefficient.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-sm font-medium text-stone-600">
              Budget total (calculé)
            </p>
            <span className="text-sm font-bold tabular-nums text-stone-950">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(budgetTotalEstime)}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
            <p className="text-sm font-medium text-orange-900">
              Marge visée (calculée)
            </p>
            <span className="text-sm font-bold tabular-nums text-orange-900">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(margeEstimee)}
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="border-b border-stone-200 pb-2">
          <h2 className="text-sm font-semibold text-stone-900">
            Planification
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Zone et calendrier prévisionnel.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="zoneCategorie">Catégorie de zone *</Label>
          <Select
            id="zoneCategorie"
            aria-invalid={!!errors.zoneCategorie}
            {...register("zoneCategorie", { valueAsNumber: true })}
          >
            <option value={1}>Zone 1</option>
            <option value={2}>Zone 2</option>
            <option value={3}>Zone 3</option>
            <option value={4}>Zone 4</option>
          </Select>
          {errors.zoneCategorie ? (
            <p className="text-xs text-destructive">
              {errors.zoneCategorie.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Date de début *</Label>
            <Input
              id="startDate"
              type="date"
              aria-invalid={!!errors.startDate}
              {...register("startDate")}
            />
            {errors.startDate ? (
              <p className="text-xs text-destructive">
                {errors.startDate.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endDate">Date de fin prévisionnelle</Label>
            <Input
              id="endDate"
              type="date"
              aria-invalid={!!errors.endDate}
              {...register("endDate")}
            />
            {errors.endDate ? (
              <p className="text-xs text-destructive">
                {errors.endDate.message}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-stone-200 pt-5 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Création…
            </>
          ) : (
            "Créer le chantier"
          )}
        </Button>
      </div>
    </form>
  );
}
