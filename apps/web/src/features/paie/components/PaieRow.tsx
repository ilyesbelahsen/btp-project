import type { PaiePreviewRow } from "@/features/paie/types";
import { formatDurationMinutes, formatMoney } from "@/lib/precision";

export function PaieRow({ row }: { row: PaiePreviewRow }) {
  return (
    <tr className="border-t border-stone-100 text-sm hover:bg-orange-50/30">
      <td className="px-4 py-3 font-semibold text-stone-900">
        {row.lastName.toUpperCase()} {row.firstName}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        {formatDurationMinutes(Math.round(row.totalHeuresTravaillees * 60))}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        {formatDurationMinutes(Math.round(row.heuresMajorees * 60))}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        {formatMoney(row.coutMajoration)}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        {formatMoney(row.montantIndemnites)}
      </td>
      <td className="px-4 py-3 text-right font-semibold tabular-nums">
        {formatMoney(row.coutTotal)}
      </td>
    </tr>
  );
}
