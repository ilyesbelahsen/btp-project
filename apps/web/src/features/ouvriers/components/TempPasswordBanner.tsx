"use client";

import { useState } from "react";
import { CheckCheck, Copy, KeyRound } from "lucide-react";
import type { CreatedOuvrier } from "@/features/ouvriers/types";
import { Button } from "@/components/ui/button";

export function TempPasswordBanner({
  ouvrier,
  onContinue,
}: {
  ouvrier: CreatedOuvrier;
  onContinue: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(ouvrier.tempPassword);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-emerald-700">
        <KeyRound className="h-5 w-5" />
        <h2 className="text-base font-semibold leading-snug">
          Fiche créée — communiquez ce mot de passe à l&apos;ouvrier
        </h2>
      </div>
      <p className="mb-1 text-sm text-emerald-700">
        <strong>
          {ouvrier.lastName.toUpperCase()} {ouvrier.firstName}
        </strong>{" "}
        — {ouvrier.email}
      </p>
      <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3">
        <code className="flex-1 font-mono text-sm font-semibold tracking-widest">
          {ouvrier.tempPassword}
        </code>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={copyToClipboard}
        >
          {copied ? (
            <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copié" : "Copier"}
        </Button>
      </div>
      <p className="mt-3 text-xs text-emerald-600">
        L&apos;ouvrier peut changer son mot de passe depuis l&apos;application
        mobile. Notez-le maintenant — il ne sera plus affiché.
      </p>
      <Button className="mt-5 w-full" onClick={onContinue}>
        Retour à la liste
      </Button>
    </div>
  );
}
