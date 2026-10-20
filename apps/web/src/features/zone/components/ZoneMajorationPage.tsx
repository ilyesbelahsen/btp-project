"use client";

import { useState } from "react";
import { Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useZoneMajorations,
  useUpdateZoneMajoration,
} from "@/features/zone/hooks/useZoneMajorations";

export function ZoneMajorationPage() {
  const { data: zones, isLoading, isError } = useZoneMajorations();
  const updateMutation = useUpdateZoneMajoration();
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  const getDraft = (zoneCategorie: number, tauxMajoration: number) =>
    drafts[zoneCategorie] ?? String(tauxMajoration * 100);

  const save = (zoneCategorie: number, tauxMajoration: number) => {
    const percentage = Number(getDraft(zoneCategorie, tauxMajoration));
    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 1000)
      return;
    updateMutation.mutate({
      zoneCategorie,
      tauxMajoration: percentage / 100,
    });
  };

  return (
    <main className="min-h-[calc(100vh-65px)] bg-stone-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 border-b border-stone-200 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
            Paramétrage paie
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">
            Majorations par zone
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Chaque modification crée une nouvelle version et ne change pas les
            périodes déjà calculées.
          </p>
        </div>

        {isLoading && <p className="text-sm text-stone-500">Chargement…</p>}
        {isError && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Impossible de charger les majorations de zone.
          </p>
        )}
        <div className="space-y-3">
          {zones?.map((zone) => (
            <section
              key={zone.zoneCategorie}
              className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-stone-900">
                    Zone {zone.zoneCategorie}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Taux actif :{" "}
                    {(zone.tauxMajoration * 100).toLocaleString("fr-FR")} %
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    className="w-28"
                    type="number"
                    min="0"
                    max="1000"
                    step="0.01"
                    value={getDraft(zone.zoneCategorie, zone.tauxMajoration)}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [zone.zoneCategorie]: event.target.value,
                      }))
                    }
                    aria-label={`Pourcentage de majoration zone ${zone.zoneCategorie}`}
                  />
                  <span className="text-sm text-stone-500">%</span>
                  <Button
                    size="sm"
                    onClick={() =>
                      save(zone.zoneCategorie, zone.tauxMajoration)
                    }
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isSuccess ? (
                      <Check className="size-4" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    Enregistrer
                  </Button>
                </div>
              </div>
              {zone.historique.length > 0 && (
                <p className="mt-3 text-xs text-stone-500">
                  Dernière version :{" "}
                  {new Date(zone.historique[0].dateEffet).toLocaleDateString(
                    "fr-FR",
                  )}
                </p>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
