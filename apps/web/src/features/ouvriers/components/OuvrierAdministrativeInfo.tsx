import { AlertCircle, Euro, Heart, MapPin, Phone, Shield } from "lucide-react";
import type { ElementType } from "react";
import type { OuvrierDetail } from "@/features/ouvriers/types";

type OuvrierAdministrativeInfoProps = {
  ouvrier: OuvrierDetail;
};

type InfoRowProps = {
  icon: ElementType;
  label: string;
  value: string | null | undefined;
};

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function OuvrierAdministrativeInfo({
  ouvrier,
}: OuvrierAdministrativeInfoProps) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
        Informations administratives
      </h2>
      <div className="divide-y rounded-xl border border-stone-200 bg-white px-4 shadow-sm">
        <InfoRow icon={Phone} label="Téléphone" value={ouvrier.phone} />
        <InfoRow icon={MapPin} label="Adresse" value={ouvrier.address} />
        <InfoRow
          icon={Shield}
          label="N° carte vitale"
          value={ouvrier.numeroCv}
        />
        <InfoRow icon={Heart} label="Mutuelle" value={ouvrier.mutuelle} />
        <InfoRow
          icon={AlertCircle}
          label="Contact d'urgence"
          value={ouvrier.contactUrgence}
        />
        <InfoRow
          icon={Euro}
          label="Taux horaire"
          value={
            ouvrier.tauxHoraire !== null ? `${ouvrier.tauxHoraire} €/h` : null
          }
        />
      </div>
    </section>
  );
}
