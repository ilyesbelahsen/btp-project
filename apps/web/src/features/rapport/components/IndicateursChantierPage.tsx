"use client";

import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import {
  useIndicateursChantier,
  useSuiviTachesChantier,
} from "@/features/rapport/hooks/useDashboardStats";
import { useChantiers } from "@/features/chantier/hooks/useChantiers";
import { SuiviTachesTable } from "@/features/rapport/components/SuiviTachesTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { KpiRow } from "@/features/rapport/components/KpiRow";
import { SuiviBudgetaireRow } from "@/features/rapport/components/SuiviBudgetaireRow";
import { IndicateursSkeleton } from "@/features/rapport/components/IndicateursSkeleton";
import { formatDurationMinutes } from "@/lib/precision";

function formatEur(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "à ce jour";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

// ── Main page ──────────────────────────────────────────────────────────────

interface Props {
  chantierId: string;
}

export function IndicateursChantierPage({ chantierId }: Props) {
  const {
    data: indicateurs,
    isLoading,
    isError,
  } = useIndicateursChantier(chantierId);
  const { data: suivisTaches, isLoading: suivisTachesLoading } =
    useSuiviTachesChantier(chantierId);
  const { data: chantiers } = useChantiers();

  const chantierName =
    indicateurs?.chantierName ??
    chantiers?.find((c) => c.id === chantierId)?.name ??
    chantierId;

  const margePositive = (indicateurs?.margeNette ?? 0) >= 0;

  const TrendIcon =
    (indicateurs?.tauxRentabilite ?? 0) > 15
      ? TrendingUp
      : (indicateurs?.tauxRentabilite ?? 0) < 0
        ? TrendingDown
        : Minus;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-50/70 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
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
              Pilotage financier
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
              Bilan financier
            </h1>
            <p className="text-sm text-stone-500">{chantierName}</p>
          </div>
        </div>

        {isLoading && <IndicateursSkeleton />}

        {isError && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Impossible de charger les indicateurs financiers.
          </p>
        )}

        {indicateurs && (
          <div className="grid gap-5 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)]">
            <div className="lg:col-span-2 rounded-lg border border-stone-200 bg-white px-4 py-3 text-xs text-stone-500 shadow-sm">
              Périmètre : {indicateurs.perimetre} · du{" "}
              {formatDate(indicateurs.periodeDebut)} au{" "}
              {formatDate(indicateurs.periodeFin)}
            </div>

            {/* Paramètres économiques */}
            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm lg:col-span-2">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
                Paramètres économiques
              </h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <KpiRow
                  label="Budget main d'œuvre"
                  value={formatEur(indicateurs.budgetMainOeuvre)}
                  sublabel="Prévisionnel HT"
                />
                <KpiRow
                  label="Budget matériaux"
                  value={formatEur(indicateurs.budgetMateriaux)}
                  sublabel="Prévisionnel HT"
                />
                <KpiRow
                  label="Budget total"
                  value={formatEur(indicateurs.budgetTotal)}
                  sublabel="Main d'œuvre + matériaux"
                />
                <KpiRow
                  label="Coefficient"
                  value={indicateurs.coefficient.toFixed(2)}
                  sublabel="Coefficient de calcul"
                />
                <KpiRow
                  label="Charge fixe"
                  value={formatEur(indicateurs.chargeFixe)}
                  sublabel="Budget × (coefficient - 1)"
                />
                <KpiRow
                  label="Marge visée"
                  value={formatEur(indicateurs.margeVisee)}
                  sublabel="Prix de vente - budget × coefficient"
                />
              </div>
            </section>

            {/* Revenus */}
            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
                Revenus
              </h2>
              <div className="space-y-2">
                <KpiRow
                  label="Prix de vente HT"
                  value={formatEur(indicateurs.prixVenteHT)}
                />
              </div>
            </section>

            {/* Coûts */}
            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
                Coûts
              </h2>
              <div className="space-y-2">
                <KpiRow
                  label="Dépenses réelles"
                  value={formatEur(indicateurs.coutDepenses)}
                />
                <KpiRow
                  label="Coût main d'œuvre"
                  value={formatEur(indicateurs.coutMainOeuvreMajore)}
                  sublabel="Heures × taux × coefficient de zone"
                />
                <KpiRow
                  label="Heures validées"
                  value={formatDurationMinutes(indicateurs.totalMinutesValides)}
                  sublabel="Pointages validés"
                />
                <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
                  <p className="text-sm font-semibold text-stone-800">
                    Coût total
                  </p>
                  <span className="text-sm font-bold tabular-nums text-stone-950">
                    {formatEur(indicateurs.coutTotal)}
                  </span>
                </div>
              </div>
            </section>

            {/* Suivi budgétaire par nature de coût */}
            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
                Suivi budgétaire
              </h2>
              <div className="space-y-2">
                <SuiviBudgetaireRow
                  label="Main d'œuvre"
                  suivi={indicateurs.suiviMainOeuvre}
                />
                <SuiviBudgetaireRow
                  label="Matériaux"
                  suivi={indicateurs.suiviMateriaux}
                />
              </div>
            </section>

            {/* Suivi budgétaire par tâche (US-C005) */}
            <section className="order-5 rounded-lg border border-stone-200 bg-white p-4 shadow-sm lg:col-span-2">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
                Suivi budgétaire par tâche
              </h2>
              {suivisTachesLoading ? (
                <div className="h-24 animate-pulse rounded-lg bg-stone-100" />
              ) : (
                <SuiviTachesTable suivis={suivisTaches ?? []} />
              )}
            </section>

            {/* Résultat */}
            <section className="order-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
                Résultat
              </h2>
              <div className="space-y-2">
                <KpiRow
                  label="Marge nette"
                  value={formatEur(indicateurs.margeNette)}
                  sublabel="Prix de vente - coefficient × coût total réel"
                  variant={margePositive ? "positive" : "negative"}
                />
                {indicateurs.tauxRentabilite !== null && (
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-4 py-3",
                      indicateurs.tauxRentabilite < 0
                        ? "border-destructive/30 bg-destructive/5"
                        : indicateurs.tauxRentabilite < 15
                          ? "border-amber-200 bg-amber-50"
                          : "border-emerald-200 bg-emerald-50",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <TrendIcon
                        className={cn("h-4 w-4", {
                          "text-emerald-600": indicateurs.tauxRentabilite >= 15,
                          "text-amber-600":
                            indicateurs.tauxRentabilite >= 0 &&
                            indicateurs.tauxRentabilite < 15,
                          "text-destructive": indicateurs.tauxRentabilite < 0,
                        })}
                      />
                      <p className="text-sm font-medium">Taux de rentabilité</p>
                    </div>
                    <span
                      className={cn("text-sm font-bold tabular-nums", {
                        "text-emerald-600": indicateurs.tauxRentabilite >= 15,
                        "text-amber-600":
                          indicateurs.tauxRentabilite >= 0 &&
                          indicateurs.tauxRentabilite < 15,
                        "text-destructive": indicateurs.tauxRentabilite < 0,
                      })}
                    >
                      {indicateurs.tauxRentabilite} %
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
