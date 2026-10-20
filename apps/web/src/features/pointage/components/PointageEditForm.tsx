"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCorrigerPointage } from "@/features/pointage/hooks/usePointages";
import type { PointageDesktop } from "@/features/pointage/types";

const TACHE_TYPES = [
  "COFFRAGE",
  "MACONNERIE",
  "FERRAILLAGE",
  "BETON",
  "FINITION",
  "DEMOLITION",
  "TERRASSEMENT",
  "PLOMBERIE",
  "ELECTRICITE",
  "AUTRE",
] as const;

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type PointageEditFormProps = {
  pointage: PointageDesktop;
  onCancel: () => void;
};

export function PointageEditForm({
  pointage,
  onCancel,
}: PointageEditFormProps) {
  const mutation = useCorrigerPointage();
  const [startTime, setStartTime] = useState(
    toDatetimeLocal(pointage.startTime),
  );
  const [endTime, setEndTime] = useState(
    pointage.endTime ? toDatetimeLocal(pointage.endTime) : "",
  );
  const [taches, setTaches] = useState<string[]>(pointage.taches);

  const toggleTache = (tache: string) => {
    setTaches((current) =>
      current.includes(tache)
        ? current.filter((item) => item !== tache)
        : [...current, tache],
    );
  };

  const save = () =>
    mutation.mutate(
      {
        id: pointage.id,
        dto: {
          startTime: startTime ? new Date(startTime).toISOString() : undefined,
          endTime: endTime ? new Date(endTime).toISOString() : undefined,
          taches,
        },
      },
      { onSuccess: onCancel },
    );

  return (
    <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {pointage.user.lastName.toUpperCase()} {pointage.user.firstName} —{" "}
          {pointage.chantier.name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs text-muted-foreground">
          Heure de début
          <Input
            type="datetime-local"
            className="h-8 text-xs"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          Heure de fin
          <Input
            type="datetime-local"
            className="h-8 text-xs"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
        </label>
      </div>
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Tâches déclarées</span>
        <div className="flex flex-wrap gap-1.5">
          {TACHE_TYPES.map((tache) => (
            <button
              key={tache}
              type="button"
              onClick={() => toggleTache(tache)}
              className={cn(
                "rounded px-2 py-0.5 text-xs transition-colors",
                taches.includes(tache)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {tache}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button
          size="sm"
          className="h-7 px-3 text-xs"
          disabled={mutation.isPending}
          onClick={save}
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          {mutation.isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
