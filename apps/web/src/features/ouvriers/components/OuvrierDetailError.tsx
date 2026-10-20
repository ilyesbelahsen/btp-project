import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function OuvrierDetailError() {
  return (
    <div className="p-4 sm:p-6">
      <Link href="/dashboard/ouvriers">
        <Button variant="ghost" size="sm" className="mb-4 gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </Link>
      <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Impossible de charger la fiche de cet ouvrier.
      </p>
    </div>
  );
}
