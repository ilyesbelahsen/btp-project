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
        {formatMoney(row.coutMainOeuvreMajore)}
        <div className="mt-1 text-left text-[11px] font-normal text-stone-500">
          {row.details.map((detail) => (
            <div key={`${detail.chantier}-${detail.zoneCategorie}`}>
              {detail.chantier} · Z{detail.zoneCategorie} ·{" "}
              {formatDurationMinutes(Math.round(detail.heuresValidees * 60))} ·{" "}
              {formatMoney(detail.tauxHoraire ?? 0)}/h · +
              {(detail.tauxMajoration * 100).toLocaleString("fr-FR")} %
            </div>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        {formatDurationMinutes(Math.round(row.heuresMajorees * 60))}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        {row.nombreIndemnites}
        <div className="mt-1 text-xs text-stone-500">
          {row.montantIndemnites > 0
            ? `${formatMoney(row.montantIndemnites)} affectées`
            : row.indemnites.length > 0
              ? row.indemnites.map((indemnite) => indemnite.libelle).join(", ")
              : "Calcul automatique historique"}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-stone-500">
        {row.chantiers.join(", ") || "—"}
      </td>
    </tr>
  );
}
