"use client";

import { Pencil, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useValiderPointage } from "@/features/pointage/hooks/usePointages";
import type { PointageDesktop } from "@/features/pointage/types";

type PointageActionsProps = {
  pointage: PointageDesktop;
  canManage: boolean;
  statusClass: string;
  statusLabel: string;
  onEdit: () => void;
  onToggleReject: () => void;
};

export function PointageActions({
  pointage,
  canManage,
  statusClass,
  statusLabel,
  onEdit,
  onToggleReject,
}: PointageActionsProps) {
  const validation = useValiderPointage();
  const reviewable = canManage && pointage.status === "SOUMIS";
  const editable = canManage && pointage.status !== "VALIDE";

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span
        className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusClass}`}
      >
        {statusLabel}
      </span>
      {reviewable && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          disabled={validation.isPending}
          onClick={() => validation.mutate(pointage.id)}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Valider
        </Button>
      )}
      {reviewable && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
          onClick={onToggleReject}
        >
          <XCircle className="h-3.5 w-3.5" />
          Rejeter
        </Button>
      )}
      {editable && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-stone-500 hover:bg-orange-50 hover:text-orange-800"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
