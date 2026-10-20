"use client";

import { useState } from "react";
import { useOuvrierDetail } from "@/features/ouvriers/hooks/useOuvriers";
import { OuvrierDetailError } from "@/features/ouvriers/components/OuvrierDetailError";
import { OuvrierDetailHeader } from "@/features/ouvriers/components/OuvrierDetailHeader";
import { OuvrierDetailSkeleton } from "@/features/ouvriers/components/OuvrierDetailSkeleton";
import { OuvrierAdministrativeInfo } from "@/features/ouvriers/components/OuvrierAdministrativeInfo";
import { OuvrierWorkHistory } from "@/features/ouvriers/components/OuvrierWorkHistory";
import { OuvrierChantiersList } from "@/features/ouvriers/components/OuvrierChantiersList";
import type { OuvrierDetailPeriod } from "@/features/ouvriers/components/OuvrierWorkHistory";

type OuvrierDetailPageProps = {
  ouvrierID: string;
};

export function OuvrierDetailPage({ ouvrierID }: OuvrierDetailPageProps) {
  const { data: ouvrier, isLoading, isError } = useOuvrierDetail(ouvrierID);
  const [periode, setPeriode] = useState<OuvrierDetailPeriod>("mois");

  if (isLoading) return <OuvrierDetailSkeleton />;
  if (isError || !ouvrier) return <OuvrierDetailError />;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      <OuvrierDetailHeader ouvrier={ouvrier} />
      <OuvrierAdministrativeInfo ouvrier={ouvrier} />
      <OuvrierWorkHistory
        pointages={ouvrier.pointages}
        periode={periode}
        onPeriodeChange={setPeriode}
      />
      <OuvrierChantiersList chantiers={ouvrier.chantiers} />
    </div>
  );
}
