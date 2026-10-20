"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { canManageBusiness } from "@/lib/permissions";
import type { TacheChantier } from "@/features/chantier/types";
import { TacheDeleteConfirmation } from "@/features/chantier/components/TacheDeleteConfirmation";
import { TacheDisplay } from "@/features/chantier/components/TacheDisplay";
import { TacheEditForm } from "@/features/chantier/components/TacheEditForm";

export function TacheRow({
  tache,
  chantierId,
}: {
  tache: TacheChantier;
  chantierId: string;
}) {
  const { user } = useAuthStore();
  const canManage = canManageBusiness(user?.role);
  const [mode, setMode] = useState<"display" | "edit" | "delete">("display");

  if (mode === "edit") {
    return (
      <TacheEditForm
        tache={tache}
        chantierId={chantierId}
        onCancel={() => setMode("display")}
      />
    );
  }

  if (mode === "delete") {
    return (
      <TacheDeleteConfirmation
        tache={tache}
        chantierId={chantierId}
        onCancel={() => setMode("display")}
      />
    );
  }

  return (
    <TacheDisplay
      tache={tache}
      canManage={canManage}
      onEdit={() => setMode("edit")}
      onDelete={() => setMode("delete")}
    />
  );
}
