import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssignOuvrier } from "@/features/chantier/hooks/useChantiers";
import type { Ouvrier } from "@/features/ouvriers/types";

export function OuvrierDisponibleRow({
  ouvrier,
  chantierId,
}: {
  ouvrier: Ouvrier;
  chantierId: string;
}) {
  const mutation = useAssignOuvrier(chantierId);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-orange-200 bg-orange-50/30 p-3">
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-stone-900">
          {ouvrier.firstName} {ouvrier.lastName}
        </span>
        <span className="text-xs text-stone-500">{ouvrier.email}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 border-orange-200 bg-white text-xs text-orange-800 hover:bg-orange-100"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate(ouvrier.id)}
      >
        <UserPlus className="h-3.5 w-3.5" />
        Affecter
      </Button>
    </div>
  );
}
