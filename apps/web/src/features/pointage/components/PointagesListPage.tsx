"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  usePointagesDesktop,
  useValiderBatch,
} from "@/features/pointage/hooks/usePointages";
import type { PointageFiltres } from "@/features/pointage/types";
import { useAuthStore } from "@/stores/auth.store";
import { canManageBusiness } from "@/lib/permissions";
import { PointageFilters } from "@/features/pointage/components/PointageFilters";
import { PointageBatchActions } from "@/features/pointage/components/PointageBatchActions";
import { PointageRow } from "@/features/pointage/components/PointageRow";
import {
  PointageErrorState,
  PointageEmptyState,
  PointageRowSkeleton,
} from "@/features/pointage/components/PointageListStates";

export function PointagesListPage() {
  const [filtres, setFiltres] = useState<PointageFiltres>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { data: pointages, isLoading, isError } = usePointagesDesktop(filtres);
  const validerBatchMutation = useValiderBatch();
  const { user } = useAuthStore();
  const canManage = canManageBusiness(user?.role);

  const soumisDisponibles =
    pointages?.filter((pointage) => pointage.status === "SOUMIS") ?? [];
  const allSoumisSelected =
    soumisDisponibles.length > 0 &&
    soumisDisponibles.every((pointage) => selectedIds.has(pointage.id));

  function toggleSelect(id: string) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSoumisSelected) setSelectedIds(new Set());
    else
      setSelectedIds(new Set(soumisDisponibles.map((pointage) => pointage.id)));
  }

  function handleValiderBatch() {
    validerBatchMutation.mutate([...selectedIds], {
      onSuccess: ({ validated }) => {
        setSelectedIds(new Set());
        setSuccessMessage(
          `${validated} pointage${validated > 1 ? "s" : ""} validé${validated > 1 ? "s" : ""} avec succès.`,
        );
        setTimeout(() => setSuccessMessage(null), 4000);
      },
    });
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-50/70 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-3 border-b border-stone-200 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
              Suivi des heures
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
              Pointages
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">
              {pointages?.length !== undefined
                ? `${pointages.length} pointage${pointages.length > 1 ? "s" : ""}`
                : "Historique des pointages"}
            </p>
          </div>
        </div>

        <section
          className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
          aria-label="Filtres des pointages"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-800">
              Filtrer les pointages
            </h2>
            <span className="text-xs text-stone-500">
              Période, ouvrier, chantier et statut
            </span>
          </div>
          <PointageFilters filtres={filtres} onFiltresChange={setFiltres} />
        </section>

        {successMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            {successMessage}
          </div>
        )}

        <PointageBatchActions
          selectedCount={selectedIds.size}
          isPending={validerBatchMutation.isPending}
          onClear={() => setSelectedIds(new Set())}
          onValidate={handleValiderBatch}
        />

        <section className="space-y-2.5" aria-label="Liste des pointages">
          {!isLoading && soumisDisponibles.length > 0 && (
            <label className="flex items-center gap-2 px-1 text-stone-500">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-orange-700"
                checked={allSoumisSelected}
                onChange={toggleSelectAll}
              />
              <span className="text-xs">
                Tout sélectionner ({soumisDisponibles.length} soumis)
              </span>
            </label>
          )}

          {isLoading && (
            <>
              <PointageRowSkeleton />
              <PointageRowSkeleton />
              <PointageRowSkeleton />
            </>
          )}
          {isError && <PointageErrorState />}
          {!isLoading && !isError && pointages?.length === 0 && (
            <PointageEmptyState />
          )}
          {pointages?.map((pointage) => (
            <PointageRow
              key={pointage.id}
              pointage={pointage}
              canManage={canManage}
              isEditing={editingId === pointage.id}
              isSelected={selectedIds.has(pointage.id)}
              onEdit={() => setEditingId(pointage.id)}
              onCancelEdit={() => setEditingId(null)}
              onToggleSelect={() => toggleSelect(pointage.id)}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
