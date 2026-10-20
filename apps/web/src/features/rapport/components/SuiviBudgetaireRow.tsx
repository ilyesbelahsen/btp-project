import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { SuiviBudgetaire } from "@/features/rapport/types";
import { cn } from "@/lib/utils";

function formatEur(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function SuiviBudgetaireRow({
  label,
  suivi,
}: {
  label: string;
  suivi: SuiviBudgetaire;
}) {
  const enDepassement = suivi.statut === "depassement";
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 shadow-sm",
        enDepassement
          ? "border-red-200 bg-red-50"
          : "border-emerald-200 bg-emerald-50",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {enDepassement ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          )}
          <p className="text-sm font-medium">{label}</p>
        </div>
        <span
          className={cn(
            "text-xs font-semibold",
            enDepassement ? "text-destructive" : "text-emerald-600",
          )}
        >
          {enDepassement ? "En dépassement" : "Dans le budget"}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
        <span>Budget : {formatEur(suivi.budget)}</span>
        <span>Réel : {formatEur(suivi.coutReel)}</span>
      </div>
    </div>
  );
}
