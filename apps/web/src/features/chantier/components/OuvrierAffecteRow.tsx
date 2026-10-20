"use client";

import { useState } from "react";
import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRemoveOuvrier } from "@/features/chantier/hooks/useChantiers";
import type { OuvrierAffecte } from "@/features/chantier/types";

export function OuvrierAffecteRow({
  ouvrier,
  chantierId,
}: {
  ouvrier: OuvrierAffecte;
  chantierId: string;
}) {
  const [confirm, setConfirm] = useState(false);
  const mutation = useRemoveOuvrier(chantierId);
  if (confirm)
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
        <p className="text-sm text-red-700">
          Retirer{" "}
          <strong>
            {ouvrier.firstName} {ouvrier.lastName}
          </strong>{" "}
          du chantier ?
        </p>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate(ouvrier.id, {
                onSettled: () => setConfirm(false),
              })
            }
          >
            Confirmer
          </Button>
          <Button variant="outline" size="sm" onClick={() => setConfirm(false)}>
            Annuler
          </Button>
        </div>
      </div>
    );
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-stone-900">
          {ouvrier.firstName} {ouvrier.lastName}
        </span>
        <span className="text-xs text-stone-500">{ouvrier.email}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-xs text-stone-500 hover:bg-red-50 hover:text-red-700"
        onClick={() => setConfirm(true)}
      >
        <UserMinus className="h-3.5 w-3.5" />
        Retirer
      </Button>
    </div>
  );
}
