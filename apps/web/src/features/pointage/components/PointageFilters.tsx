"use client";

import { useChantiers } from "@/features/chantier/hooks/useChantiers";
import { useOuvriers } from "@/features/ouvriers/hooks/useOuvriers";
import { POINTAGE_STATUS_LABELS } from "@/features/pointage/types";
import type { PointageFiltres } from "@/features/pointage/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type PointageFiltersProps = {
  filtres: PointageFiltres;
  onFiltresChange: (filtres: PointageFiltres) => void;
};

export function PointageFilters({
  filtres,
  onFiltresChange,
}: PointageFiltersProps) {
  function update(patch: Partial<PointageFiltres>) {
    onFiltresChange({ ...filtres, ...patch });
  }

  const { data: chantiers } = useChantiers();
  const { data: ouvriers } = useOuvriers();

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Select
        className="h-10 w-full border-stone-200 bg-stone-50 text-sm sm:w-44"
        value={filtres.userId ?? ""}
        onChange={(event) =>
          update({ userId: event.target.value || undefined })
        }
      >
        <option value="">Tous les ouvriers</option>
        {ouvriers?.map((ouvrier) => (
          <option key={ouvrier.id} value={ouvrier.id}>
            {ouvrier.lastName.toUpperCase()} {ouvrier.firstName}
          </option>
        ))}
      </Select>

      <Select
        className="h-10 w-full border-stone-200 bg-stone-50 text-sm sm:w-48"
        value={filtres.chantierId ?? ""}
        onChange={(event) =>
          update({ chantierId: event.target.value || undefined })
        }
      >
        <option value="">Tous les chantiers</option>
        {chantiers?.map((chantier) => (
          <option key={chantier.id} value={chantier.id}>
            {chantier.name}
          </option>
        ))}
      </Select>

      <Select
        className="h-10 w-full border-stone-200 bg-stone-50 text-sm sm:w-36"
        value={filtres.status ?? ""}
        onChange={(event) =>
          update({ status: event.target.value || undefined })
        }
      >
        <option value="">Tous les statuts</option>
        {Object.entries(POINTAGE_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Input
        type="date"
        className="h-10 w-full border-stone-200 bg-stone-50 text-sm sm:w-40"
        value={filtres.dateFrom ?? ""}
        onChange={(event) =>
          update({ dateFrom: event.target.value || undefined })
        }
      />
      <span className="hidden text-xs text-stone-400 sm:inline">→</span>
      <Input
        type="date"
        className="h-10 w-full border-stone-200 bg-stone-50 text-sm sm:w-40"
        value={filtres.dateTo ?? ""}
        onChange={(event) =>
          update({ dateTo: event.target.value || undefined })
        }
      />
    </div>
  );
}
