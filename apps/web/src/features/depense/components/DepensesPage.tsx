"use client";

import Link from "next/link";
import { ArrowLeft, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { canManageBusiness, hasRole } from "@/lib/permissions";
import { useChantiers } from "@/features/chantier/hooks/useChantiers";
import { useDepensesChantier } from "@/features/depense/hooks/useDepenses";
import { CreateDepenseForm } from "@/features/depense/components/CreateDepenseForm";
import { DepenseRow } from "@/features/depense/components/DepenseRow";
import { formatEur } from "@/features/depense/components/formatters";

export function DepensesPage({ chantierId }: { chantierId: string }) {
  const { user } = useAuthStore();
  const canManage = canManageBusiness(user?.role);
  const canCreate = canManage || user?.role === "CONDUCTEUR";
  const canControl = hasRole(user?.role, ["ADMIN", "PATRON", "COMPTABLE"]);
  const {
    data: depenses,
    isLoading,
    isError,
  } = useDepensesChantier(chantierId);
  const { data: chantiers } = useChantiers();
  const chantierName =
    chantiers?.find((chantier) => chantier.id === chantierId)?.name ??
    chantierId;
  const total =
    depenses?.reduce((sum, depense) => sum + depense.montant, 0) ?? 0;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-50/70 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex items-center gap-3 border-b border-stone-200 pb-5">
          <Link href="/dashboard/chantiers">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-stone-500 hover:bg-orange-50 hover:text-orange-800"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
              Suivi des achats
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
              Dépenses
            </h1>
            <p className="text-sm text-stone-500">{chantierName}</p>
          </div>
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-stone-900">
                  Dépenses enregistrées
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  Achats et contrôles du chantier
                </p>
              </div>
              {depenses && (
                <span className="text-xs font-medium text-stone-500">
                  {depenses.length} dépense{depenses.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {isLoading &&
                [...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-lg border border-stone-200 bg-stone-50"
                  />
                ))}
              {isError && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  Erreur lors du chargement des dépenses.
                </p>
              )}
              {!isLoading && !isError && depenses?.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-10 text-center">
                  <div className="rounded-full bg-orange-50 p-3 text-orange-700">
                    <Receipt className="h-7 w-7" />
                  </div>
                  <p className="text-sm text-stone-500">
                    Aucune dépense enregistrée pour ce chantier.
                  </p>
                </div>
              )}
              {depenses?.map((depense) => (
                <DepenseRow
                  key={depense.id}
                  depense={depense}
                  chantierId={chantierId}
                  canControl={canControl}
                />
              ))}
            </div>
            {depenses && depenses.length > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm">
                <span className="font-medium text-stone-500">Total cumulé</span>
                <span className="font-semibold tabular-nums text-stone-900">
                  Total HT : {formatEur(total)}
                </span>
              </div>
            )}
          </section>
          {canCreate && (
            <aside className="lg:sticky lg:top-5">
              <CreateDepenseForm chantierId={chantierId} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
