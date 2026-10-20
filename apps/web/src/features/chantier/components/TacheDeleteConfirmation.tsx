import { useDeleteTache } from "@/features/chantier/hooks/useChantiers";
import type { TacheChantier } from "@/features/chantier/types";
import { Button } from "@/components/ui/button";

export function TacheDeleteConfirmation({
  tache,
  chantierId,
  onCancel,
}: {
  tache: TacheChantier;
  chantierId: string;
  onCancel: () => void;
}) {
  const mutation = useDeleteTache(chantierId);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
      <p className="text-sm text-destructive">
        Supprimer &quot;{tache.libelle}&quot; ?
      </p>
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => mutation.mutate(tache.id, { onSuccess: onCancel })}
          disabled={mutation.isPending}
        >
          Confirmer
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
