"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDurationMinutes } from "@/lib/precision";
import type { SuiviBudgetaire, SuiviTache } from "@/features/rapport/types";

function formatEur(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ── Statut vert/rouge par nature de coût (BR-C-015) ─────────────────────────

function StatutBadge({ suivi }: { suivi: SuiviBudgetaire }) {
  const enDepassement = suivi.statut === "depassement";

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
          enDepassement
            ? "bg-destructive/10 text-destructive"
            : "bg-emerald-100 text-emerald-700",
        )}
      >
        {enDepassement ? (
          <AlertTriangle className="size-3" />
        ) : (
          <CheckCircle2 className="size-3" />
        )}
        {enDepassement ? "Dépassement" : "Dans le budget"}
      </span>
      <span className="text-xs text-muted-foreground">
        {formatEur(suivi.coutReel)} / {formatEur(suivi.budget)}
      </span>
    </div>
  );
}

// ── Ligne par tâche (CA1/CA2) ────────────────────────────────────────────────

function SuiviTacheRow({ suivi }: { suivi: SuiviTache }) {
  return (
    <tr className="border-b border-stone-100 last:border-0">
      <td className="py-3 pl-4 pr-4 text-sm font-semibold text-stone-800">
        {suivi.libelle}
      </td>
      <td className="py-2 pr-4 text-sm text-stone-600">
        {formatDurationMinutes(suivi.minutesMainOeuvre)}
      </td>
      <td className="py-2 pr-4">
        <StatutBadge suivi={suivi.suiviMainOeuvre} />
      </td>
      <td className="py-2 pr-4">
        <StatutBadge suivi={suivi.suiviMateriaux} />
      </td>
    </tr>
  );
}

// ── Tableau de suivi budgétaire par tâche (US-C005) ─────────────────────────

type SuiviTachesTableProps = {
  suivis: SuiviTache[];
};

export function SuiviTachesTable({ suivis }: SuiviTachesTableProps) {
  if (suivis.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-stone-300 bg-white p-5 text-center text-sm text-stone-500">
        Aucune tâche budgétée pour ce chantier.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
      <table className="w-full min-w-[420px] border-collapse px-4">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs text-stone-500">
            <th className="py-2 pl-4 pr-4 font-medium">Tâche</th>
            <th className="py-2 pr-4 font-medium">Heures validées</th>
            <th className="py-2 pr-4 font-medium">Main d&apos;œuvre</th>
            <th className="py-2 pr-4 font-medium">Matériaux</th>
          </tr>
        </thead>
        <tbody className="px-4">
          {suivis.map((suivi) => (
            <SuiviTacheRow key={suivi.tacheId} suivi={suivi} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
