"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  useChantiers,
  useUpdateChantier,
} from "@/features/chantier/hooks/useChantiers";
import {
  CreateChantierSchema,
  type CreateChantierFormData,
} from "@/features/chantier/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type ApiError = {
  response?: { data?: { message?: string } };
};

function toDateInput(isoString: string | null): string {
  if (!isoString) return "";
  return isoString.split("T")[0];
}

interface Props {
  chantierId: string;
}

export function EditChantierPage({ chantierId }: Props) {
  const router = useRouter();
  const { data: chantiers, isLoading } = useChantiers();
  const mutation = useUpdateChantier();

  const chantier = chantiers?.find((c) => c.id === chantierId);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateChantierFormData>({
    resolver: zodResolver(CreateChantierSchema),
    values: chantier
      ? {
          name: chantier.name,
          address: chantier.address,
          client: chantier.client ?? "",
          budgetMainOeuvre: chantier.budgetMainOeuvre ?? 0,
          budgetMateriaux: chantier.budgetMateriaux ?? 0,
          coefficient: chantier.coefficient,
          prixVenteHT: chantier.prixVenteHT,
          zoneCategorie: chantier.zoneCategorie ?? 1,
          startDate: toDateInput(chantier.startDate),
          endDate: toDateInput(chantier.endDate) || undefined,
        }
      : undefined,
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
        id: chantierId,
        dto: {
          ...data,
          budgetMainOeuvre: Number(data.budgetMainOeuvre),
          budgetMateriaux: Number(data.budgetMateriaux),
          coefficient: Number(data.coefficient),
          zoneCategorie: Number(data.zoneCategorie),
          endDate: data.endDate || undefined,
        },
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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!chantier) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-destructive">Chantier introuvable.</p>
      </div>
    );
  }

  if (chantier.status !== "EN_COURS") {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Ce chantier est terminé et ne peut plus être modifié.
        </p>
        <Link href="/dashboard/chantiers">
          <Button variant="ghost" size="sm" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/chantiers">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Modifier le chantier</h1>
          <p className="text-sm text-muted-foreground">{chantier.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {mutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Une erreur est survenue. Vérifiez les informations saisies.
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Nom du chantier *</Label>
            <Input id="edit-name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-client">Client *</Label>
            <Input id="edit-client" {...register("client")} />
            {errors.client && (
              <p className="text-xs text-destructive">
                {errors.client.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-address">Adresse *</Label>
          <Input id="edit-address" {...register("address")} />
          {errors.address && (
            <p className="text-xs text-destructive">{errors.address.message}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-budget-mo">
              Budget main d&apos;œuvre HT (€) *
            </Label>
            <Input
              id="edit-budget-mo"
              type="number"
              step="0.01"
              min="0"
              {...register("budgetMainOeuvre", { valueAsNumber: true })}
            />
            {errors.budgetMainOeuvre && (
              <p className="text-xs text-destructive">
                {errors.budgetMainOeuvre.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-budget-materiaux">
              Budget matériaux HT (€) *
            </Label>
            <Input
              id="edit-budget-materiaux"
              type="number"
              step="0.01"
              min="0"
              {...register("budgetMateriaux", { valueAsNumber: true })}
            />
            {errors.budgetMateriaux && (
              <p className="text-xs text-destructive">
                {errors.budgetMateriaux.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-prix-vente">Prix de vente HT (€) *</Label>
          <Input
            id="edit-prix-vente"
            type="number"
            step="0.01"
            min="0"
            {...register("prixVenteHT", { valueAsNumber: true })}
          />
          {errors.prixVenteHT && (
            <p className="text-xs text-destructive">
              {errors.prixVenteHT.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-coefficient">Coefficient de calcul *</Label>
          <Input
            id="edit-coefficient"
            type="number"
            min="0.01"
            step="0.01"
            {...register("coefficient", { valueAsNumber: true })}
          />
          {errors.coefficient && (
            <p className="text-xs text-destructive">
              {errors.coefficient.message}
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
            <p className="text-sm font-medium">Budget total (calculé)</p>
            <span className="text-sm font-bold tabular-nums">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(budgetTotalEstime)}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
            <p className="text-sm font-medium">Marge visée (calculée)</p>
            <span className="text-sm font-bold tabular-nums">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(margeEstimee)}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-zone">Zone *</Label>
          <Select
            id="edit-zone"
            {...register("zoneCategorie", { valueAsNumber: true })}
          >
            {[1, 2, 3, 4].map((z) => (
              <option key={z} value={z}>
                Zone {z}
              </option>
            ))}
          </Select>
          {errors.zoneCategorie && (
            <p className="text-xs text-destructive">
              {errors.zoneCategorie.message}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-start">Date de début *</Label>
            <Input id="edit-start" type="date" {...register("startDate")} />
            {errors.startDate && (
              <p className="text-xs text-destructive">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-end">Date de fin prévisionnelle</Label>
            <Input id="edit-end" type="date" {...register("endDate")} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/chantiers")}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
}
