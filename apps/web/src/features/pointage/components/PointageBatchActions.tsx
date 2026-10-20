import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type PointageBatchActionsProps = {
  selectedCount: number;
  isPending: boolean;
  onClear: () => void;
  onValidate: () => void;
};

export function PointageBatchActions({
  selectedCount,
  isPending,
  onClear,
  onValidate,
}: PointageBatchActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
      <span className="text-sm font-semibold text-orange-900">
        {selectedCount} pointage{selectedCount > 1 ? "s" : ""} sélectionné
        {selectedCount > 1 ? "s" : ""}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-orange-200 bg-white text-xs text-stone-600"
          onClick={onClear}
        >
          Désélectionner
        </Button>
        <Button
          size="sm"
          className="h-8 gap-1.5 bg-emerald-600 text-xs hover:bg-emerald-700"
          disabled={isPending}
          onClick={onValidate}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {isPending ? "Validation…" : `Valider (${selectedCount})`}
        </Button>
      </div>
    </div>
  );
}
