import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PointageResume } from "@/features/ouvriers/types";
import { formatDurationMinutes, pointageMinutes } from "@/lib/precision";

const POINTAGE_STATUS: Record<string, { label: string; className: string }> = {
  EN_COURS: { label: "En cours", className: "bg-blue-100 text-blue-700" },
  TERMINE: { label: "Terminé", className: "bg-muted text-muted-foreground" },
  VALIDE: { label: "Validé", className: "bg-emerald-100 text-emerald-700" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR");
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PointageRow({ pointage }: { pointage: PointageResume }) {
  const status = POINTAGE_STATUS[pointage.status] ?? POINTAGE_STATUS.TERMINE;

  return (
    <div className="rounded-lg border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-orange-700" />
          <span className="text-sm font-medium">
            {formatDate(pointage.startTime)}
          </span>
          <span className="text-xs text-muted-foreground">
            — {pointage.chantier.name}
          </span>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
            status.className,
          )}
        >
          {status.label}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 pl-5 text-xs text-muted-foreground">
        <span>
          {formatTime(pointage.startTime)}
          {pointage.endTime ? ` → ${formatTime(pointage.endTime)}` : ""}
        </span>
        {pointageMinutes(pointage) !== null && (
          <span className="font-medium text-foreground">
            {formatDurationMinutes(pointageMinutes(pointage))}
          </span>
        )}
        {pointage.taches.length > 0 && (
          <span className="truncate">{pointage.taches.join(", ")}</span>
        )}
      </div>
    </div>
  );
}

type OuvrierPointagesListProps = {
  pointages: PointageResume[];
};

export function OuvrierPointagesList({ pointages }: OuvrierPointagesListProps) {
  if (pointages.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5 text-center text-sm text-stone-500">
        Aucun pointage sur cette période.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {pointages.map((pointage) => (
        <PointageRow key={pointage.id} pointage={pointage} />
      ))}
    </div>
  );
}
