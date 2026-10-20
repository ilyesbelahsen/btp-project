import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChantierResume } from "@/features/ouvriers/types";

const CHANTIER_STATUS_CLASS: Record<string, string> = {
  EN_COURS: "bg-emerald-100 text-emerald-700",
  TERMINE: "bg-gray-100 text-gray-600",
  EN_PAUSE: "bg-amber-100 text-amber-700",
  ANNULE: "bg-red-100 text-red-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR");
}

function ChantierRow({ chantier }: { chantier: ChantierResume }) {
  const statusClass =
    CHANTIER_STATUS_CLASS[chantier.status] ?? CHANTIER_STATUS_CLASS.EN_COURS;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex min-w-0 items-center gap-2">
        <Building2 className="h-4 w-4 shrink-0 text-orange-700" />
        <span className="truncate text-sm font-medium">{chantier.name}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
        <span>{formatDate(chantier.startDate)}</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            statusClass,
          )}
        >
          {chantier.status.replace("_", " ")}
        </span>
      </div>
    </div>
  );
}

type OuvrierChantiersListProps = {
  chantiers: ChantierResume[];
};

export function OuvrierChantiersList({ chantiers }: OuvrierChantiersListProps) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
        Chantiers affectés ({chantiers.length})
      </h2>
      {chantiers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5 text-center text-sm text-stone-500">
          Aucun chantier affecté.
        </p>
      ) : (
        <div className="space-y-2">
          {chantiers.map((chantier) => (
            <ChantierRow key={chantier.id} chantier={chantier} />
          ))}
        </div>
      )}
    </section>
  );
}
