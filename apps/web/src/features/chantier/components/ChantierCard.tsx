"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Building2,
  CheckCircle,
  Euro,
  ListChecks,
  MapPin,
  Pencil,
  Receipt,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useDeleteChantier,
  useTerminerChantier,
} from "@/features/chantier/hooks/useChantiers";
import type { Chantier } from "@/features/chantier/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { canManageBusiness } from "@/lib/permissions";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  EN_COURS: {
    label: "En cours",
    className: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  TERMINE: {
    label: "Terminé",
    className: "border border-stone-200 bg-stone-100 text-stone-600",
  },
  EN_PAUSE: {
    label: "En pause",
    className: "border border-amber-200 bg-amber-50 text-amber-700",
  },
  ANNULE: {
    label: "Annulé",
    className: "border border-red-200 bg-red-50 text-red-700",
  },
};

function formatEur(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function ChantierCard({ chantier }: { chantier: Chantier }) {
  const { user } = useAuthStore();
  const canManage = canManageBusiness(user?.role);
  const [confirmation, setConfirmation] = useState<
    "terminer" | "supprimer" | null
  >(null);
  const terminer = useTerminerChantier();
  const supprimer = useDeleteChantier();
  const status = STATUS_CONFIG[chantier.status] ?? STATUS_CONFIG.EN_COURS;
  const links = [
    [`/dashboard/chantiers/${chantier.id}/taches`, ListChecks, "Tâches"],
    [`/dashboard/chantiers/${chantier.id}/ouvriers`, Users, "Ouvriers"],
    [`/dashboard/chantiers/${chantier.id}/depenses`, Receipt, "Dépenses"],
    [`/dashboard/chantiers/${chantier.id}/indicateurs`, BarChart3, "Bilan"],
  ] as const;
  const visibleLinks = links.filter(([, , label]) =>
    user?.role === "CONDUCTEUR"
      ? label !== "Bilan" && label !== "Ouvriers"
      : true,
  );

  return (
    <div className="flex min-h-[276px] flex-col rounded-lg border border-stone-200 bg-white shadow-[0_1px_2px_rgb(28_25_23/0.04)] transition-shadow hover:shadow-md">
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="rounded-md bg-orange-50 p-1.5 text-orange-700">
              <Building2 className="size-4" />
            </div>
            <h3 className="truncate text-sm font-semibold leading-tight text-stone-900">
              {chantier.name}
            </h3>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold",
              status.className,
            )}
          >
            {status.label}
          </span>
        </div>
        {chantier.client && (
          <p className="truncate pl-9 text-xs font-medium text-stone-500">
            {chantier.client}
          </p>
        )}
        <div className="flex items-center gap-1.5 pl-9 text-xs text-stone-500">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{chantier.address}</span>
        </div>
      </div>
      <div className="flex items-center justify-between border-y border-stone-200 bg-stone-50/70 px-5 py-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold tabular-nums text-stone-800">
          <Euro className="size-3.5 text-orange-700" />
          {formatEur(chantier.prixVenteHT)}
        </div>
        <div className="text-right text-[11px] text-stone-500">
          <div>Coef. {chantier.coefficient.toLocaleString("fr-FR")}</div>
          <div>Marge {formatEur(chantier.marge)}</div>
        </div>
        {chantier.zoneCategorie && (
          <span className="rounded bg-stone-200 px-2 py-1 text-[11px] font-medium text-stone-600">
            Zone {chantier.zoneCategorie}
          </span>
        )}
      </div>
      <div
        className={cn(
          "grid divide-x divide-stone-200",
          user?.role === "CONDUCTEUR" ? "grid-cols-2" : "grid-cols-4",
        )}
      >
        {visibleLinks.map(([href, Icon, label]) => (
          <Link
            key={label}
            href={href}
            className="flex min-w-0 flex-col items-center gap-1 py-3 text-[11px] font-medium text-stone-500 transition-colors hover:bg-orange-50 hover:text-orange-800 focus-visible:z-10"
          >
            <Icon className="size-3.5" />
            <span className="max-w-full truncate px-1">{label}</span>
          </Link>
        ))}
      </div>
      {canManage && chantier.status === "EN_COURS" && (
        <div className="border-t">
          {confirmation === null && (
            <div className="flex items-center justify-end gap-1 border-t border-stone-200 px-3 py-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs text-stone-600"
              >
                <Link href={`/dashboard/chantiers/${chantier.id}/modifier`}>
                  <Pencil className="size-3.5" />
                  Modifier
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs text-amber-700"
                onClick={() => setConfirmation("terminer")}
              >
                <CheckCircle className="size-3.5" />
                Terminer
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-destructive"
                onClick={() => setConfirmation("supprimer")}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
          {confirmation && (
            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 px-3 py-2.5",
                confirmation === "terminer"
                  ? "bg-amber-50"
                  : "bg-destructive/5",
              )}
            >
              <p
                className={cn(
                  "text-xs",
                  confirmation === "terminer"
                    ? "text-amber-700"
                    : "text-destructive",
                )}
              >
                {confirmation === "terminer"
                  ? "Clôturer définitivement ce chantier ?"
                  : "Supprimer ce chantier et toutes ses données ?"}
              </p>
              <div className="flex gap-1">
                <Button
                  variant={
                    confirmation === "supprimer" ? "destructive" : "default"
                  }
                  size="sm"
                  disabled={terminer.isPending || supprimer.isPending}
                  onClick={() =>
                    confirmation === "terminer"
                      ? terminer.mutate(chantier.id, {
                          onSettled: () => setConfirmation(null),
                        })
                      : supprimer.mutate(chantier.id, {
                          onSettled: () => setConfirmation(null),
                        })
                  }
                >
                  {confirmation === "terminer" ? "Confirmer" : "Supprimer"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmation(null)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
