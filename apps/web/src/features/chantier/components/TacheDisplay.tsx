import { Pencil, Trash2 } from "lucide-react";
import type { TacheChantier } from "@/features/chantier/types";
import { Button } from "@/components/ui/button";

function formatCurrency(value: number): string {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export function TacheDisplay({
  tache,
  canManage,
  onEdit,
  onDelete,
}: {
  tache: TacheChantier;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50/30">
      <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1">
        <span className="flex-1 text-sm font-semibold text-stone-900">
          {tache.libelle}
        </span>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-stone-800">
          {tache.prixVenduHT === null
            ? "Prix non défini"
            : formatCurrency(tache.prixVenduHT)}
        </span>
        <span className="shrink-0 text-xs text-stone-500">
          MO :{" "}
          {tache.budgetMainOeuvre === null
            ? "—"
            : formatCurrency(tache.budgetMainOeuvre)}
        </span>
        <span className="shrink-0 text-xs text-stone-500">
          Matériaux :{" "}
          {tache.budgetMateriaux === null
            ? "—"
            : formatCurrency(tache.budgetMateriaux)}
        </span>
      </div>
      {canManage && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-stone-500 hover:bg-orange-50 hover:text-orange-800"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-stone-500 hover:bg-red-50 hover:text-red-700"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
