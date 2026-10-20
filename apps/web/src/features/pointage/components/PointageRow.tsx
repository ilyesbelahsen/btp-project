"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  UserRound,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  POINTAGE_STATUS_LABELS,
  type PointageDesktop,
} from "@/features/pointage/types";
import { PointageActions } from "@/features/pointage/components/PointageActions";
import { PointageEditForm } from "@/features/pointage/components/PointageEditForm";
import { PointageRejectionForm } from "@/features/pointage/components/PointageRejectionForm";
import { formatDurationMinutes, pointageMinutes } from "@/lib/precision";

const STATUS_STYLE: Record<string, string> = {
  EN_COURS: "border border-blue-200 bg-blue-50 text-blue-700",
  TERMINE: "border border-stone-200 bg-stone-100 text-stone-600",
  SOUMIS: "border border-amber-200 bg-amber-50 text-amber-700",
  REJETE: "border border-red-200 bg-red-50 text-red-700",
  VALIDE: "border border-emerald-200 bg-emerald-50 text-emerald-700",
};

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR");
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

type PointageRowProps = {
  pointage: PointageDesktop;
  canManage: boolean;
  isEditing: boolean;
  isSelected: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onToggleSelect: () => void;
};

export function PointageRow({
  pointage,
  canManage,
  isEditing,
  isSelected,
  onEdit,
  onCancelEdit,
  onToggleSelect,
}: PointageRowProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const reviewable = canManage && pointage.status === "SOUMIS";
  const statusClass = STATUS_STYLE[pointage.status] ?? STATUS_STYLE.TERMINE;
  const statusLabel =
    POINTAGE_STATUS_LABELS[pointage.status] ?? pointage.status;

  if (isEditing)
    return <PointageEditForm pointage={pointage} onCancel={onCancelEdit} />;

  return (
    <div
      className={cn(
        "grid items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-4 text-sm shadow-sm transition-colors sm:grid-cols-[auto_1fr_1fr_auto_auto_auto] sm:gap-4",
        isSelected && "border-orange-300 bg-orange-50/50",
      )}
    >
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-stone-300 accent-orange-700"
        checked={isSelected}
        onChange={onToggleSelect}
        disabled={!reviewable}
        title={reviewable ? "Sélectionner pour validation" : ""}
      />
      <div className="flex min-w-0 items-center gap-2">
        <UserRound className="h-3.5 w-3.5 shrink-0 text-orange-700" />
        <span className="truncate font-semibold text-stone-900">
          {pointage.user.lastName.toUpperCase()} {pointage.user.firstName}
        </span>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <Building2 className="h-3.5 w-3.5 shrink-0 text-orange-700" />
        <span className="truncate text-stone-600">
          {pointage.chantier.name}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(pointage.startTime)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTime(pointage.startTime)}
          {pointage.endTime ? ` → ${formatTime(pointage.endTime)}` : ""}
        </span>
        {pointageMinutes(pointage) !== null && (
          <span className="font-semibold text-stone-900">
            {formatDurationMinutes(pointageMinutes(pointage))}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-stone-500">
        {pointage.taches.length > 0 ? (
          <span className="max-w-[140px] truncate">
            {pointage.taches.join(", ")}
          </span>
        ) : (
          <span className="italic">—</span>
        )}
        {pointage.correctedAt && (
          <span title="Pointage corrigé">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          </span>
        )}
        {pointage.comment && (
          <span
            className="max-w-[220px] truncate text-stone-500"
            title={pointage.comment}
          >
            Commentaire : {pointage.comment}
          </span>
        )}
      </div>
      <PointageActions
        pointage={pointage}
        canManage={canManage}
        statusClass={statusClass}
        statusLabel={statusLabel}
        onEdit={onEdit}
        onToggleReject={() => setIsRejecting((current) => !current)}
      />
      {isRejecting && reviewable && (
        <PointageRejectionForm pointageId={pointage.id} />
      )}
      {pointage.status === "REJETE" && pointage.rejectionReason && (
        <p className="col-span-full flex items-center gap-1 border-t border-red-200 pt-2 text-xs text-red-700">
          <XCircle className="h-3.5 w-3.5" />
          Motif : {pointage.rejectionReason}
        </p>
      )}
    </div>
  );
}
