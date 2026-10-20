"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  History,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useControleDepense,
  useDepenseHistorique,
} from "@/features/depense/hooks/useDepenses";
import {
  DEPENSE_CATEGORIE_LABELS,
  DEPENSE_STATUT_CONTROLE_LABELS,
  type Depense,
} from "@/features/depense/types";
import { DepenseHistory } from "@/features/depense/components/DepenseHistory";
import {
  formatDate,
  formatDateTime,
  formatEur,
} from "@/features/depense/components/formatters";

export function DepenseRow({
  depense,
  chantierId,
  canControl,
}: {
  depense: Depense;
  chantierId: string;
  canControl: boolean;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const control = useControleDepense(chantierId);
  const history = useDepenseHistorique(depense.id, showHistory);
  const reviewable = depense.statutControle !== "ACCEPTEE";
  const statusClass =
    depense.statutControle === "ACCEPTEE"
      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
      : depense.statutControle === "REJETEE"
        ? "border border-red-200 bg-red-50 text-red-700"
        : "border border-amber-200 bg-amber-50 text-amber-700";

  function reject() {
    const motif = reason.trim();
    if (motif.length < 3) return;
    control.mutate(
      { id: depense.id, dto: { statut: "REJETEE", motifRejet: motif } },
      {
        onSuccess: () => {
          setRejecting(false);
          setReason("");
        },
      },
    );
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs font-medium text-stone-600">
              {DEPENSE_CATEGORIE_LABELS[depense.categorie]}
            </span>
            {depense.tacheLibelle && (
              <span className="truncate rounded bg-orange-50 px-1.5 py-0.5 text-xs font-medium text-orange-800">
                {depense.tacheLibelle}
              </span>
            )}
            {depense.fournisseur && (
              <span className="truncate text-xs text-stone-500">
                {depense.fournisseur}
              </span>
            )}
            <span className="text-xs text-stone-500">
              {formatDate(depense.date)}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
            >
              {DEPENSE_STATUT_CONTROLE_LABELS[depense.statutControle]}
            </span>
          </div>
          {depense.statutControle === "REJETEE" && depense.motifRejet && (
            <p className="flex items-center gap-1 text-xs text-red-700">
              <XCircle className="h-3.5 w-3.5" />
              Motif : {depense.motifRejet}
            </p>
          )}
          {depense.controleeAt && (
            <p className="text-xs text-stone-500">
              Dernier contrôle : {formatDateTime(depense.controleeAt)}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-semibold tabular-nums text-stone-900">
            {formatEur(depense.montant)}
          </span>
          {canControl && reviewable && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs text-emerald-600"
                disabled={control.isPending}
                onClick={() =>
                  control.mutate({
                    id: depense.id,
                    dto: { statut: "ACCEPTEE" },
                  })
                }
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Accepter
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs text-red-600"
                disabled={control.isPending}
                onClick={() => setRejecting((value) => !value)}
              >
                <XCircle className="h-3.5 w-3.5" />
                Rejeter
              </Button>
            </>
          )}
          {depense.controleeAt && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={() => setShowHistory((value) => !value)}
            >
              <History className="h-3.5 w-3.5" />
              Historique
              {showHistory ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>
      {rejecting && (
        <div className="mt-3 flex items-center gap-2 border-t border-stone-200 pt-3">
          <Input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Motif du rejet"
            maxLength={500}
            aria-label="Motif du rejet"
          />
          <Button
            size="sm"
            variant="destructive"
            disabled={reason.trim().length < 3 || control.isPending}
            onClick={reject}
          >
            Confirmer
          </Button>
        </div>
      )}
      {control.isError && (
        <p className="mt-2 text-xs text-destructive">
          Le contrôle de la dépense a échoué. Réessayez.
        </p>
      )}
      {showHistory && (
        <div className="mt-3 border-t border-stone-200 pt-3">
          {history.isLoading && (
            <p className="text-xs text-muted-foreground">
              Chargement de l&apos;historique…
            </p>
          )}
          {history.isError && (
            <p className="text-xs text-destructive">
              Impossible de charger l&apos;historique.
            </p>
          )}
          {history.data && <DepenseHistory entries={history.data} />}
        </div>
      )}
    </div>
  );
}
