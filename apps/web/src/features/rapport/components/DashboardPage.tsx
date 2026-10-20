"use client";

import { Building2, Euro, TrendingDown, TrendingUp } from "lucide-react";
import { useDashboardStats } from "@/features/rapport/hooks/useDashboardStats";
import { KpiCard, KpiCardSkeleton } from "./KpiCard";
import { ChantierSyntheseList } from "./ChantierSyntheseList";

function formatEur(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function DashboardPage() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl p-4 text-sm text-destructive sm:p-6">
        Impossible de charger les indicateurs.
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-50/70 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <div className="flex flex-col justify-between gap-3 border-b border-stone-200 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
              Pilotage opérationnel
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
              Tableau de bord
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">
              Synthèse de l&apos;activité — chantiers actifs
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
            <span className="size-2 rounded-full bg-emerald-500" />
            Données à jour
          </div>
        </div>

        <section aria-labelledby="indicateurs-title" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              id="indicateurs-title"
              className="text-sm font-semibold text-stone-800"
            >
              Indicateurs clés
            </h2>
            <span className="text-xs text-stone-500">Vue entreprise</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {isLoading ? (
              <>
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
              </>
            ) : (
              <>
                <KpiCard
                  label="Chantiers actifs"
                  value={String(stats?.chantiersActifs ?? 0)}
                  icon={<Building2 className="size-5" />}
                  subtitle="en cours de réalisation"
                />
                <KpiCard
                  label="CA total HT"
                  value={formatEur(stats?.caTotalHT ?? 0)}
                  icon={<Euro className="size-5" />}
                  subtitle="prix de vente cumulé"
                />
                <KpiCard
                  label="Dépenses totales"
                  value={formatEur(stats?.depensesTotales ?? 0)}
                  icon={<TrendingDown className="size-5" />}
                  subtitle="dépenses acceptées"
                />
                <KpiCard
                  label="Coût réel"
                  value={formatEur(stats?.coutTotal ?? 0)}
                  icon={<TrendingDown className="size-5" />}
                  subtitle="dépenses + heures validées"
                />
                <KpiCard
                  label="Marge globale"
                  value={formatEur(stats?.margeGlobale ?? 0)}
                  icon={<TrendingUp className="size-5" />}
                  trend={
                    (stats?.margeGlobale ?? 0) >= 0 ? "positive" : "negative"
                  }
                  subtitle="CA − coût réel"
                />
              </>
            )}
          </div>
        </section>

        <ChantierSyntheseList />
      </div>
    </div>
  );
}
