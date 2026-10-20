"use client";

import { useChantiersSynthese } from "@/features/rapport/hooks/useDashboardStats";
import { ChantierSyntheseRow } from "@/features/rapport/components/ChantierSyntheseRow";
import { ChantierSyntheseSkeleton } from "@/features/rapport/components/ChantierSyntheseSkeleton";

export function ChantierSyntheseList() {
  const { data: chantiers, isLoading, isError } = useChantiersSynthese();

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Impossible de charger la synthèse des chantiers.
      </p>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between border-b border-stone-200 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
            Suivi financier
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-stone-950">
            Synthèse par chantier
          </h2>
        </div>
        <span className="hidden text-xs text-stone-500 sm:block">
          Marge et consommation
        </span>
      </div>

      {isLoading ? (
        <>
          <ChantierSyntheseSkeleton />
          <ChantierSyntheseSkeleton />
          <ChantierSyntheseSkeleton />
        </>
      ) : !chantiers?.length ? (
        <p className="rounded-lg border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-sm text-stone-500">
          Aucun chantier actif pour le moment.
        </p>
      ) : (
        chantiers.map((chantier) => (
          <ChantierSyntheseRow key={chantier.id} chantier={chantier} />
        ))
      )}
    </section>
  );
}
