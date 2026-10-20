import { Clock } from "lucide-react";
import { Select } from "@/components/ui/select";
import type { PointageResume } from "@/features/ouvriers/types";
import { OuvrierPointagesList } from "@/features/ouvriers/components/OuvrierPointagesList";
import { formatDurationMinutes, pointageMinutes } from "@/lib/precision";

const PERIOD_VALUES = ["mois", "mois-1", "3mois", "6mois", "tout"] as const;
export type OuvrierDetailPeriod = (typeof PERIOD_VALUES)[number];
const PERIOD_SET: ReadonlySet<string> = new Set(PERIOD_VALUES);

function isPeriod(value: string): value is OuvrierDetailPeriod {
  return PERIOD_SET.has(value);
}

function filterPointagesByPeriod(
  pointages: PointageResume[],
  periode: OuvrierDetailPeriod,
): PointageResume[] {
  if (periode === "tout") return pointages;

  const now = new Date();
  const debut = new Date(now);
  if (periode === "mois") debut.setDate(1);
  if (periode === "mois-1") {
    debut.setMonth(now.getMonth() - 1);
    debut.setDate(1);
  }
  if (periode === "3mois") debut.setMonth(now.getMonth() - 3);
  if (periode === "6mois") debut.setMonth(now.getMonth() - 6);

  return pointages.filter((pointage) => new Date(pointage.startTime) >= debut);
}

type OuvrierWorkHistoryProps = {
  pointages: PointageResume[];
  periode: OuvrierDetailPeriod;
  onPeriodeChange: (periode: OuvrierDetailPeriod) => void;
};

export function OuvrierWorkHistory({
  pointages,
  periode,
  onPeriodeChange,
}: OuvrierWorkHistoryProps) {
  const pointagesFiltres = filterPointagesByPeriod(pointages, periode);
  const totalMinutes = pointagesFiltres.reduce(
    (total, pointage) => total + (pointageMinutes(pointage) ?? 0),
    0,
  );

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
          Heures travaillées
        </h2>
        <Select
          className="h-9 w-full border-stone-200 bg-white text-xs shadow-sm sm:w-48"
          value={periode}
          onChange={(event) => {
            if (isPeriod(event.target.value))
              onPeriodeChange(event.target.value);
          }}
        >
          <option value="mois">Ce mois-ci</option>
          <option value="mois-1">Mois dernier</option>
          <option value="3mois">3 derniers mois</option>
          <option value="6mois">6 derniers mois</option>
          <option value="tout">Tout l&apos;historique</option>
        </Select>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums text-stone-950">
            {formatDurationMinutes(totalMinutes)}
          </p>
          <p className="text-xs text-muted-foreground">
            {pointagesFiltres.length} pointage
            {pointagesFiltres.length > 1 ? "s" : ""} sur la période
          </p>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
        Historique des pointages
      </h2>
      <OuvrierPointagesList pointages={pointagesFiltres} />
    </section>
  );
}
