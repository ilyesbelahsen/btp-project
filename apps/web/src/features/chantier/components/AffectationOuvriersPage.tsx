"use client";

import { useState } from "react";
import { UserPlus, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import {
  useOuvriersChantier,
  useChantiers,
} from "@/features/chantier/hooks/useChantiers";
import { useOuvriers } from "@/features/ouvriers/hooks/useOuvriers";
import type { Ouvrier } from "@/features/ouvriers/types";
import { Button } from "@/components/ui/button";
import { OuvrierAffecteRow } from "@/features/chantier/components/OuvrierAffecteRow";
import { OuvrierDisponibleRow } from "@/features/chantier/components/OuvrierDisponibleRow";

interface Props {
  chantierId: string;
}

export function AffectationOuvriersPage({ chantierId }: Props) {
  const { data: ouvriersAffectes, isLoading: loadingAffectes } =
    useOuvriersChantier(chantierId);
  const { data: tousLesOuvriers, isLoading: loadingTous } = useOuvriers();
  const { data: chantiers } = useChantiers();

  const chantierName =
    chantiers?.find((c) => c.id === chantierId)?.name ?? chantierId;

  const affectesIds = new Set(ouvriersAffectes?.map((o) => o.id) ?? []);
  const disponibles =
    tousLesOuvriers?.filter((o) => !affectesIds.has(o.id)) ?? [];

  const isLoading = loadingAffectes || loadingTous;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-50/70 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-5xl">
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
              Organisation du chantier
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
              Affectation des ouvriers
            </h1>
            <p className="text-sm text-stone-500">{chantierName}</p>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg border border-stone-200 bg-white"
              />
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Ouvriers affectés */}
            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-700" />
                  <h2 className="text-sm font-semibold text-stone-900">
                    Ouvriers affectés{" "}
                    <span className="font-normal text-stone-500">
                      ({ouvriersAffectes?.length ?? 0})
                    </span>
                  </h2>
                </div>
              </div>

              {ouvriersAffectes?.length === 0 ? (
                <p className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-stone-500">
                  Aucun ouvrier affecté à ce chantier.
                </p>
              ) : (
                <div className="space-y-2">
                  {ouvriersAffectes?.map((o) => (
                    <OuvrierAffecteRow
                      key={o.id}
                      ouvrier={o}
                      chantierId={chantierId}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Ouvriers disponibles */}
            {disponibles.length > 0 && (
              <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-orange-700" />
                    <h2 className="text-sm font-semibold text-stone-900">
                      Ouvriers disponibles ({disponibles.length})
                    </h2>
                  </div>
                </div>
                <div className="space-y-2">
                  {disponibles.map((o) => (
                    <OuvrierDisponibleRow
                      key={o.id}
                      ouvrier={o}
                      chantierId={chantierId}
                    />
                  ))}
                </div>
              </section>
            )}

            {tousLesOuvriers?.length === 0 && (
              <p className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500 lg:col-span-2">
                Aucun ouvrier enregistré dans l&apos;entreprise.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
