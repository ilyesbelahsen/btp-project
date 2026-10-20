import { AlertTriangle, CheckCircle, MapPin, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlertLevel, ChantierSynthese } from "@/features/rapport/types";

const ALERT_CONFIG: Record<
  AlertLevel,
  {
    icon: React.ReactNode;
    borderClass: string;
    margeClass: string;
    label: string;
  }
> = {
  ok: {
    icon: <CheckCircle className="size-4 text-emerald-600" />,
    borderClass: "border-l-emerald-500",
    margeClass: "text-emerald-600",
    label: "Rentable",
  },
  warning: {
    icon: <AlertTriangle className="size-4 text-amber-500" />,
    borderClass: "border-l-amber-400",
    margeClass: "text-amber-600",
    label: "Marge faible",
  },
  critical: {
    icon: <XCircle className="size-4 text-red-600" />,
    borderClass: "border-l-red-500",
    margeClass: "text-red-700",
    label: "En déficit",
  },
};

const formatEur = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export function ChantierSyntheseRow({
  chantier,
}: {
  chantier: ChantierSynthese;
}) {
  const config = ALERT_CONFIG[chantier.alertLevel];
  const progress =
    chantier.prixVenteHT > 0
      ? Math.min(
          Math.round((chantier.coutTotal / chantier.prixVenteHT) * 100),
          100,
        )
      : 0;
  return (
    <div
      className={cn(
        "rounded-lg border border-l-4 bg-white p-4 shadow-[0_1px_2px_rgb(28_25_23/0.04)] transition-shadow hover:shadow-md sm:p-5",
        config.borderClass,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            {config.icon}
            <span className="truncate text-sm font-semibold text-stone-900">
              {chantier.name}
            </span>
            {chantier.zoneCategorie && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-500">
                <MapPin className="size-3" />
                Zone {chantier.zoneCategorie}
              </span>
            )}
          </div>
          <div className="mt-2">
            <div className="mb-1 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:gap-3">
              <span>Coût réel : {formatEur(chantier.coutTotal)}</span>
              <span className="sm:text-right">
                Prix de vente HT : {formatEur(chantier.prixVenteHT)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-500",
                  chantier.alertLevel === "critical"
                    ? "bg-red-500"
                    : chantier.alertLevel === "warning"
                      ? "bg-amber-400"
                      : "bg-emerald-500",
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <p
            className={cn("text-lg font-bold tabular-nums", config.margeClass)}
          >
            {formatEur(chantier.marge)}
          </p>
          {chantier.tauxRentabilite !== null && (
            <p className="text-xs text-muted-foreground">
              {chantier.tauxRentabilite} % marge
            </p>
          )}
          <p className={cn("mt-0.5 text-xs font-medium", config.margeClass)}>
            {config.label}
          </p>
        </div>
      </div>
    </div>
  );
}
