"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  CreateOuvrierSchema,
  type CreateOuvrierFormData,
  type CreateOuvrierFormInput,
} from "@/features/ouvriers/schemas";
import { useCreateOuvrier } from "@/features/ouvriers/hooks/useOuvriers";
import type { CreatedOuvrier } from "@/features/ouvriers/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TempPasswordBanner } from "@/features/ouvriers/components/TempPasswordBanner";

type ApiError = {
  response?: { data?: { message?: string } };
};

export function CreateOuvrierPage() {
  const router = useRouter();
  const mutation = useCreateOuvrier();
  const [createdOuvrier, setCreatedOuvrier] = useState<CreatedOuvrier | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOuvrierFormInput, unknown, CreateOuvrierFormData>({
    resolver: zodResolver(CreateOuvrierSchema),
  });

  function onSubmit(formData: CreateOuvrierFormData) {
    mutation.mutate(
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        tauxHoraire: formData.tauxHoraire,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        numeroCv: formData.numeroCv || undefined,
        mutuelle: formData.mutuelle || undefined,
        contactUrgence: formData.contactUrgence || undefined,
      },
      {
        onSuccess: (ouvrier) => setCreatedOuvrier(ouvrier),
        onError: (err: unknown) => {
          const apiError = err as ApiError;
          console.error(apiError.response?.data?.message);
        },
      },
    );
  }

  if (createdOuvrier) {
    return (
      <div className="min-h-[calc(100vh-65px)] bg-stone-50/70 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mx-auto max-w-lg">
          <TempPasswordBanner
            ouvrier={createdOuvrier}
            onContinue={() => router.push("/dashboard/ouvriers")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-50/70 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-7 flex items-center gap-3 border-b border-stone-200 pb-5">
          <Link href="/dashboard/ouvriers">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-stone-500 hover:bg-orange-50 hover:text-orange-800"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
              Gestion de l&apos;équipe
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
              Nouvel ouvrier
            </h1>
            <p className="text-sm text-stone-500">
              Informations administratives et contrat
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-7 rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-7"
        >
          {mutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
              {(mutation.error as ApiError)?.response?.data?.message ??
                "Une erreur est survenue."}
            </div>
          )}

          {/* Identité */}
          <fieldset className="space-y-4">
            <legend className="border-b border-stone-200 pb-2 text-sm font-semibold text-stone-900">
              Identité
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && (
                  <p className="text-xs text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Nom *</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && (
                  <p className="text-xs text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email (identifiant de connexion) *</Label>
              <Input
                id="email"
                type="email"
                placeholder="prenom.nom@exemple.fr"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                placeholder="12 rue des Chênes, 75001 Paris"
                {...register("address")}
              />
            </div>
          </fieldset>

          {/* Contact */}
          <fieldset className="space-y-4">
            <legend className="border-b border-stone-200 pb-2 text-sm font-semibold text-stone-900">
              Contact
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="06 00 00 00 00"
                  {...register("phone")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactUrgence">Contact d&apos;urgence</Label>
                <Input
                  id="contactUrgence"
                  placeholder="Marie Dupont — 06 99 99 99 99"
                  {...register("contactUrgence")}
                />
              </div>
            </div>
          </fieldset>

          {/* Administratif */}
          <fieldset className="space-y-4">
            <legend className="border-b border-stone-200 pb-2 text-sm font-semibold text-stone-900">
              Administratif
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="numeroCv">N° carte vitale</Label>
                <Input
                  id="numeroCv"
                  placeholder="1 80 01 75 …"
                  {...register("numeroCv")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mutuelle">Mutuelle</Label>
                <Input
                  id="mutuelle"
                  placeholder="Nom de la mutuelle"
                  {...register("mutuelle")}
                />
              </div>
            </div>
          </fieldset>

          {/* Rémunération */}
          <fieldset className="space-y-4">
            <legend className="border-b border-stone-200 pb-2 text-sm font-semibold text-stone-900">
              Rémunération
            </legend>

            <div className="max-w-xs space-y-1.5">
              <Label htmlFor="tauxHoraire">Taux horaire brut (€/h) *</Label>
              <Input
                id="tauxHoraire"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="15.50"
                {...register("tauxHoraire")}
              />
              {errors.tauxHoraire && (
                <p className="text-xs text-destructive">
                  {errors.tauxHoraire.message}
                </p>
              )}
              <p className="text-xs text-stone-500">
                Utilisé pour le calcul du coût main d&apos;œuvre sur les
                chantiers
              </p>
            </div>
          </fieldset>

          <div className="flex flex-col-reverse justify-end gap-3 border-t border-stone-200 pt-5 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/ouvriers")}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Créer la fiche
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
