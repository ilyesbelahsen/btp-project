"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { usePaieExport, usePaiePreview } from "@/features/paie/hooks/usePaie";
import { exportCsv, exportExcel } from "@/features/paie/utils/export";
import type { PeriodePaie } from "@/features/paie/types";
import { PaieExportActions } from "@/features/paie/components/PaieExportActions";
import { PaiePeriodSelector } from "@/features/paie/components/PaiePeriodSelector";
import {
  buildPeriode,
  type PresetPeriode,
} from "@/features/paie/components/paie-period";
import { PaieRow } from "@/features/paie/components/PaieRow";
import { formatDurationMinutes, formatMoney } from "@/lib/precision";

export function PaiePreviewPage() {
  const [preset, setPreset] = useState<PresetPeriode>("mois");
  const [userFilter, setUserFilter] = useState("all");
  const [chantierFilter, setChantierFilter] = useState("all");
  const [customPeriode, setCustomPeriode] = useState<PeriodePaie>({
    dateFrom: new Date().toISOString().split("T")[0],
    dateTo: new Date().toISOString().split("T")[0],
  });
  const periode = buildPeriode(preset, customPeriode);
  const { data: rows, isLoading, isError } = usePaiePreview(periode);
  const exportMutation = usePaieExport(periode);
  const list = rows ?? [];
  const chantiers = [
    ...new Set(
      list.flatMap((row) => row.details.map((detail) => detail.chantier)),
    ),
  ].sort();
  const filteredList = list
    .filter((row) => userFilter === "all" || row.userId === userFilter)
    .map((row) => {
      const details = row.details.filter(
        (detail) =>
          chantierFilter === "all" || detail.chantier === chantierFilter,
      );
      return {
        ...row,
        totalHeuresTravaillees: details.reduce(
          (sum, detail) => sum + detail.heuresValidees,
          0,
        ),
        heuresMajorees: details.reduce(
          (sum, detail) => sum + detail.heuresValidees * detail.tauxMajoration,
          0,
        ),
        coutMainOeuvreMajore: details.reduce(
          (sum, detail) => sum + detail.coutMainOeuvreMajore,
          0,
        ),
        details,
        chantiers: [...new Set(details.map((detail) => detail.chantier))],
      };
    })
    .filter((row) => row.details.length > 0);
  const runExport = (kind: "csv" | "excel") =>
    exportMutation.mutate(undefined, {
      onSuccess: (exportRows) =>
        kind === "csv"
          ? exportCsv(exportRows, periode)
          : exportExcel(exportRows, periode),
    });

  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-50/70 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-3 border-b border-stone-200 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
              Préparation comptable
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
              Prévisualisation paie
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">
              Récapitulatif en lecture seule des heures validées par ouvrier
            </p>
          </div>
        </div>
        <section
          className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
          aria-label="Période de paie"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-800">
              Période analysée
            </h2>
            <span className="text-xs text-stone-500">Heures validées</span>
          </div>
          <PaiePeriodSelector
            preset={preset}
            periode={periode}
            onPresetChange={setPreset}
            onCustomChange={setCustomPeriode}
          />
          <div className="mt-4 grid gap-3 border-t border-stone-100 pt-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-stone-600">
              Ouvrier
              <select
                className="mt-1 block h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm font-normal text-stone-800"
                value={userFilter}
                onChange={(event) => setUserFilter(event.target.value)}
              >
                <option value="all">Tous les ouvriers</option>
                {list.map((row) => (
                  <option key={row.userId} value={row.userId}>
                    {row.lastName.toUpperCase()} {row.firstName}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-stone-600">
              Chantier
              <select
                className="mt-1 block h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm font-normal text-stone-800"
                value={chantierFilter}
                onChange={(event) => setChantierFilter(event.target.value)}
              >
                <option value="all">Tous les chantiers</option>
                {chantiers.map((chantier) => (
                  <option key={chantier} value={chantier}>
                    {chantier}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
        <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px]">
            <thead className="bg-stone-100 text-xs font-semibold uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3 text-left">Ouvrier</th>
                <th className="px-4 py-3 text-right">Heures travaillées</th>
                <th className="px-4 py-3 text-right">Coût MO majoré</th>
                <th className="px-4 py-3 text-right">Heures majorées</th>
                <th className="px-4 py-3 text-right">Indemnités</th>
                <th className="px-4 py-3 text-left">Chantiers</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-stone-500"
                  >
                    Chargement…
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-red-700"
                  >
                    Impossible de charger les données de paie.
                  </td>
                </tr>
              )}
              {!isLoading && !isError && filteredList.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <Users className="mx-auto h-8 w-8 text-orange-300" />
                    <p className="text-sm text-stone-500">
                      Aucun pointage validé sur cette période.
                    </p>
                  </td>
                </tr>
              )}
              {filteredList.map((row) => (
                <PaieRow key={row.userId} row={row} />
              ))}
            </tbody>
            {filteredList.length > 0 && (
              <tfoot className="border-t border-stone-200 bg-stone-100 text-xs font-semibold text-stone-800">
                <tr>
                  <td className="px-4 py-2">
                    {filteredList.length} ouvrier
                    {filteredList.length > 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatDurationMinutes(
                      Math.round(
                        filteredList.reduce(
                          (sum, row) => sum + row.totalHeuresTravaillees,
                          0,
                        ) * 60,
                      ),
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatMoney(
                      filteredList.reduce(
                        (sum, row) => sum + row.coutMainOeuvreMajore,
                        0,
                      ),
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatDurationMinutes(
                      Math.round(
                        filteredList.reduce(
                          (sum, row) => sum + row.heuresMajorees,
                          0,
                        ) * 60,
                      ),
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {filteredList.reduce(
                      (sum, row) => sum + row.nombreIndemnites,
                      0,
                    )}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {filteredList.length > 0 && (
          <PaieExportActions
            rows={list}
            periode={periode}
            onCsv={() => runExport("csv")}
            onExcel={() => runExport("excel")}
            isPending={exportMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}
