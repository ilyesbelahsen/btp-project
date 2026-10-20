import type { DepenseControleHistorique } from "@/features/depense/types";
import { DEPENSE_STATUT_CONTROLE_LABELS } from "@/features/depense/types";
import { formatDateTime } from "@/features/depense/components/formatters";

export function DepenseHistory({
  entries,
}: {
  entries: DepenseControleHistorique[];
}) {
  return (
    <div className="space-y-1">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between gap-3 text-xs text-muted-foreground"
        >
          <span>
            {DEPENSE_STATUT_CONTROLE_LABELS[entry.statut]} par{" "}
            {entry.auteur.firstName} {entry.auteur.lastName}
            {entry.motif && ` : ${entry.motif}`}
          </span>
          <span className="shrink-0">{formatDateTime(entry.createdAt)}</span>
        </div>
      ))}
    </div>
  );
}
