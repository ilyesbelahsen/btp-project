"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRejeterPointage } from "@/features/pointage/hooks/usePointages";

export function PointageRejectionForm({ pointageId }: { pointageId: string }) {
  const mutation = useRejeterPointage();
  const [reason, setReason] = useState("");

  const reject = () =>
    mutation.mutate(
      { id: pointageId, reason: reason.trim() },
      {
        onSuccess: () => setReason(""),
      },
    );

  return (
    <div className="col-span-full flex items-center gap-2 border-t pt-2">
      <Input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Motif du rejet"
        maxLength={500}
        aria-label="Motif du rejet"
      />
      <Button
        size="sm"
        variant="destructive"
        disabled={reason.trim().length < 3 || mutation.isPending}
        onClick={reject}
      >
        Confirmer
      </Button>
    </div>
  );
}
