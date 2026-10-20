import { FileDown, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaiePreviewRow, PeriodePaie } from "@/features/paie/types";

export function PaieExportActions({
  rows,
  periode,
  onCsv,
  onExcel,
  isPending,
}: {
  rows: PaiePreviewRow[];
  periode: PeriodePaie;
  onCsv: () => void;
  onExcel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-stone-200 bg-white px-5 py-4 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-stone-800">
          Export de la période
        </p>
        <p className="text-xs text-stone-500">
          {periode.dateFrom} → {periode.dateTo} · {rows.length} ouvrier
          {rows.length > 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onCsv}
          disabled={isPending}
        >
          <FileDown className="h-4 w-4" />
          CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onExcel}
          disabled={isPending}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Excel (.xls)
        </Button>
      </div>
    </div>
  );
}
