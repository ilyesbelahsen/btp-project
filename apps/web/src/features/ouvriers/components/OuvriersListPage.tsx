"use client";

import { useState } from "react";
import { Search, Users, Plus } from "lucide-react";
import Link from "next/link";
import { useOuvriers } from "@/features/ouvriers/hooks/useOuvriers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OuvrierRow } from "@/features/ouvriers/components/OuvrierRow";
import { OuvrierRowSkeleton } from "@/features/ouvriers/components/OuvrierRowSkeleton";

// ── Main page ──────────────────────────────────────────────────────────────

export function OuvriersListPage() {
  const { data: ouvriers, isLoading, isError } = useOuvriers();
  const [recherche, setRecherche] = useState("");
  const nombreOuvriers = ouvriers?.length ?? 0;

  // CA2 : filtrage local par nom/prénom — données déjà en cache TanStack Query
  const ouvriersFiltres = ouvriers?.filter((o) => {
    if (!recherche.trim()) return true;
    const terme = recherche.toLowerCase();
    return (
      o.firstName.toLowerCase().includes(terme) ||
      o.lastName.toLowerCase().includes(terme)
    );
  });

  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-50/70 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-7">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
              Équipe terrain
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
              Ouvriers
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">
              {nombreOuvriers
                ? `${nombreOuvriers} ouvrier${nombreOuvriers > 1 ? "s" : ""}`
                : "Équipe de l'entreprise"}
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard/ouvriers/nouveau">
              <Plus className="size-4" />
              Nouvel ouvrier
            </Link>
          </Button>
        </div>

        {/* CA2 : recherche */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Rechercher par nom ou prénom…"
            className="h-10 border-stone-200 bg-white pl-9 shadow-sm"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>

        {/* Liste */}
        <div className="space-y-2.5">
          {isLoading && (
            <>
              <OuvrierRowSkeleton />
              <OuvrierRowSkeleton />
              <OuvrierRowSkeleton />
            </>
          )}

          {isError && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Impossible de charger les ouvriers.
            </p>
          )}

          {!isLoading && !isError && ouvriers?.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-stone-300 bg-white py-16 text-center">
              <div className="rounded-full bg-orange-50 p-3 text-orange-700">
                <Users className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium text-stone-600">
                Aucun ouvrier enregistré
              </p>
            </div>
          )}

          {!isLoading &&
            !isError &&
            nombreOuvriers > 0 &&
            ouvriersFiltres?.length === 0 && (
              <p className="rounded-lg border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">
                Aucun ouvrier ne correspond à &quot;{recherche}&quot;.
              </p>
            )}

          {ouvriersFiltres?.map((ouvrier) => (
            <OuvrierRow key={ouvrier.id} ouvrier={ouvrier} />
          ))}
        </div>
      </div>
    </div>
  );
}
