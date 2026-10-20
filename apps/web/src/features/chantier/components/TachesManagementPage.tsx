"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  useChantiers,
  useTachesChantier,
} from "@/features/chantier/hooks/useChantiers";
import { AddTacheForm } from "@/features/chantier/components/AddTacheForm";
import { TacheRow } from "@/features/chantier/components/TacheRow";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { canManageBusiness } from "@/lib/permissions";

type TachesManagementPageProps = {
  chantierId: string;
};

export function TachesManagementPage({
  chantierId,
}: TachesManagementPageProps) {
  const { data: taches, isLoading, isError } = useTachesChantier(chantierId);
  const { data: chantiers } = useChantiers();
  const { user } = useAuthStore();
  const canManage = canManageBusiness(user?.role);
  const canAdd = canManage || user?.role === "CONDUCTEUR";
  const chantierName =
    chantiers?.find((chantier) => chantier.id === chantierId)?.name ??
    chantierId;
  const totalHT =
    taches?.reduce((total, tache) => total + (tache.prixVenduHT ?? 0), 0) ?? 0;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-50/70 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex items-center gap-3 border-b border-stone-200 pb-5">
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
              Organisation du chantier
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
              Tâches du chantier
            </h1>
            <p className="text-sm text-stone-500">{chantierName}</p>
          </div>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-stone-900">
                  Liste des tâches
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  Détail des postes du chantier
                </p>
              </div>
              {taches && (
                <span className="text-xs font-medium text-stone-500">
                  {taches.length} poste{taches.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {isLoading && <TaskListSkeleton />}
              {isError && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  Erreur lors du chargement des tâches.
                </p>
              )}
              {!isLoading && !isError && taches?.length === 0 && (
                <p className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-stone-500">
                  Aucune tâche pour ce chantier. Ajoutez la première ci-dessous.
                </p>
              )}
              {taches?.map((tache) => (
                <TacheRow
                  key={tache.id}
                  tache={tache}
                  chantierId={chantierId}
                />
              ))}
            </div>
            {taches && taches.length > 0 && (
              <div className="mt-4">
                <TaskSummary count={taches.length} total={totalHT} />
              </div>
            )}
          </section>

          {canAdd && (
            <aside className="lg:sticky lg:top-5">
              <AddTacheForm chantierId={chantierId} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-lg border border-stone-200 bg-white"
        />
      ))}
    </div>
  );
}

function TaskSummary({ count, total }: { count: number; total: number }) {
  return (
    <div className="mb-6 flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm shadow-sm">
      <span className="font-medium text-stone-500">
        {count} tâche{count > 1 ? "s" : ""}
      </span>
      <span className="font-semibold tabular-nums text-stone-900">
        Total HT :{" "}
        {total.toLocaleString("fr-FR", {
          style: "currency",
          currency: "EUR",
        })}
      </span>
    </div>
  );
}
