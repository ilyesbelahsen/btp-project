import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { PeriodePaie } from "@/features/paie/types";
import type { PresetPeriode } from "@/features/paie/components/paie-period";

export function PaiePeriodSelector({
  preset,
  periode,
  onPresetChange,
  onCustomChange,
}: {
  preset: PresetPeriode;
  periode: PeriodePaie;
  onPresetChange: (preset: PresetPeriode) => void;
  onCustomChange: (periode: PeriodePaie) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Select
        className="h-10 w-full border-stone-200 bg-stone-50 text-sm sm:w-48"
        value={preset}
        onChange={(event) =>
          onPresetChange(event.target.value as PresetPeriode)
        }
      >
        <option value="semaine">Cette semaine</option>
        <option value="mois">Ce mois-ci</option>
        <option value="mois-1">Mois dernier</option>
        <option value="perso">Période personnalisée</option>
      </Select>
      {preset === "perso" ? (
        <>
          <Input
            type="date"
            className="h-10 w-full border-stone-200 bg-stone-50 text-sm sm:w-40"
            value={periode.dateFrom}
            onChange={(event) =>
              onCustomChange({ ...periode, dateFrom: event.target.value })
            }
          />
          <span className="hidden text-xs text-stone-400 sm:inline">→</span>
          <Input
            type="date"
            className="h-10 w-full border-stone-200 bg-stone-50 text-sm sm:w-40"
            value={periode.dateTo}
            onChange={(event) =>
              onCustomChange({ ...periode, dateTo: event.target.value })
            }
          />
        </>
      ) : (
        <span className="text-xs text-stone-500">
          {periode.dateFrom} → {periode.dateTo}
        </span>
      )}
    </div>
  );
}
