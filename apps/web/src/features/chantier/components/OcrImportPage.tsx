"use client";

import { useChantier } from "@/features/chantier/hooks/useChantiers";

export function OcrImportPage({ chantierId }: { chantierId: string }) {
  const { data: chantier, isLoading, isError } = useChantier(chantierId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-sm text-muted-foreground">
        Chargement…
      </div>
    );
  }

  const chantierName = isError ? chantierId : (chantier?.name ?? chantierId);

  return (
    <div className="mx-auto max-w-2xl p-6 text-sm text-muted-foreground">
      Import devis pour <strong>{chantierName}</strong> — fonctionnalité à
      venir.
    </div>
  );
}
