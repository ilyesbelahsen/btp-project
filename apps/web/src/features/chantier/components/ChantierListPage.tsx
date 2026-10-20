"use client";

import Link from "next/link";
import { Building2, Plus, RotateCcw, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useChantiers } from "@/features/chantier/hooks/useChantiers";
import { ChantierCard } from "@/features/chantier/components/ChantierCard";
import type { ChantierStatus } from "@/features/chantier/types";
import { useAuthStore } from "@/stores/auth.store";
import { canManageBusiness } from "@/lib/permissions";

const CHANTIER_STATUS_LABELS: Record<ChantierStatus, string> = {
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  EN_PAUSE: "En pause",
  ANNULE: "Annulé",
};

function ChantierCardSkeleton() {
  return (
    <div className="h-[276px] animate-pulse rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="space-y-3 p-5">
        <div className="flex justify-between gap-3">
          <div className="h-4 w-36 rounded bg-stone-200" />
          <div className="h-5 w-16 rounded-full bg-stone-200" />
        </div>
        <div className="h-3 w-48 rounded bg-stone-200" />
        <div className="h-3 w-56 rounded bg-stone-200" />
      </div>
      <div className="mt-8 h-12 border-y border-stone-200 bg-stone-50" />
      <div className="mt-12 h-10 bg-stone-100" />
    </div>
  );
}

export function ChantierListPage() {
  const { data: chantiers, isLoading, isError } = useChantiers();
  const { user } = useAuthStore();
  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState<ChantierStatus | "">("");
  const canManage = canManageBusiness(user?.role);
  const count = chantiers?.length ?? 0;
  const chantiersFiltres = chantiers?.filter((chantier) => {
    const terme = recherche.trim().toLocaleLowerCase();
    const correspondAuTexte =
      !terme ||
      [chantier.name, chantier.address, chantier.client]
        .filter((champ): champ is string => Boolean(champ))
        .some((champ) => champ.toLocaleLowerCase().includes(terme));

    return correspondAuTexte && (!statut || chantier.status === statut);
  });
  const hasActiveFilters = recherche.trim().length > 0 || Boolean(statut);

  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-50/70 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
              Activité terrain
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
              Chantiers
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">
              {count ? `${count} chantier(s)` : "Gérez vos chantiers"}
            </p>
          </div>
          {canManage && (
            <Button asChild size="sm">
              <Link href="/dashboard/chantiers/nouveau">
                <Plus className="size-4" />
                Nouveau chantier
              </Link>
            </Button>
          )}
        </div>
        {isError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Impossible de charger les chantiers.
          </p>
        )}
        {!isLoading && !isError && count > 0 && (
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
              <Input
                aria-label="Rechercher un chantier"
                placeholder="Rechercher par nom, adresse ou client"
                className="h-10 border-stone-200 bg-white pl-9 shadow-sm"
                value={recherche}
                onChange={(event) => setRecherche(event.target.value)}
              />
            </div>
            <Select
              aria-label="Filtrer par statut"
              className="h-10 w-full border-stone-200 bg-white text-sm sm:w-44"
              value={statut}
              onChange={(event) =>
                setStatut(event.target.value as ChantierStatus | "")
              }
            >
              <option value="">Tous les statuts</option>
              {Object.entries(CHANTIER_STATUS_LABELS).map(([status, label]) => (
                <option key={status} value={status}>
                  {label}
                </option>
              ))}
            </Select>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 shrink-0 gap-1.5 text-stone-600"
                onClick={() => {
                  setRecherche("");
                  setStatut("");
                }}
              >
                <RotateCcw className="size-3.5" />
                Réinitialiser
              </Button>
            )}
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <>
              <ChantierCardSkeleton />
              <ChantierCardSkeleton />
              <ChantierCardSkeleton />
            </>
          ) : !count ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 bg-white px-4 py-16 text-center">
              <div className="mb-4 rounded-full bg-orange-50 p-3 text-orange-700">
                <Building2 className="size-7" />
              </div>
              <p className="text-sm font-medium text-stone-700">
                Aucun chantier pour le moment
              </p>
              {canManage && (
                <Button asChild size="sm" className="mt-4">
                  <Link href="/dashboard/chantiers/nouveau">
                    <Plus className="size-4" />
                    Créer le premier chantier
                  </Link>
                </Button>
              )}
            </div>
          ) : chantiersFiltres?.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed border-stone-300 bg-white px-4 py-12 text-center">
              <p className="text-sm font-medium text-stone-700">
                Aucun chantier ne correspond à vos filtres.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setRecherche("");
                  setStatut("");
                }}
              >
                Effacer les filtres
              </Button>
            </div>
          ) : (
            chantiersFiltres?.map((chantier) => (
              <ChantierCard key={chantier.id} chantier={chantier} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
