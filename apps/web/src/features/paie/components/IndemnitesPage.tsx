"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOuvriers } from "@/features/ouvriers/hooks/useOuvriers";
import {
  useCreateIndemnite,
  useCreateIndemniteAffectation,
  useDeleteIndemniteAffectation,
  useIndemniteAffectations,
  useIndemnites,
  useUpdateIndemnite,
  useUpdateIndemniteAffectation,
} from "@/features/paie/indemnites.hooks";

const today = new Date().toISOString().slice(0, 10);

export function IndemnitesPage() {
  const { data: indemnites, isLoading: loadingIndemnites } = useIndemnites();
  const { data: affectations, isLoading: loadingAffectations } =
    useIndemniteAffectations();
  const { data: ouvriers } = useOuvriers();
  const createIndemnite = useCreateIndemnite();
  const updateIndemnite = useUpdateIndemnite();
  const createAffectation = useCreateIndemniteAffectation();
  const deleteAffectation = useDeleteIndemniteAffectation();
  const updateAffectation = useUpdateIndemniteAffectation();
  const [libelle, setLibelle] = useState("");
  const [montant, setMontant] = useState("");
  const [regle, setRegle] = useState("");
  const [userId, setUserId] = useState("");
  const [indemniteId, setIndemniteId] = useState("");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [quantite, setQuantite] = useState("1");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLibelle, setEditingLibelle] = useState("");
  const [editingMontant, setEditingMontant] = useState("");
  const [editingRegle, setEditingRegle] = useState("");
  const [editingAffectationId, setEditingAffectationId] = useState<
    string | null
  >(null);
  const [editingDateFrom, setEditingDateFrom] = useState("");
  const [editingDateTo, setEditingDateTo] = useState("");
  const [editingQuantite, setEditingQuantite] = useState("1");
  const [editingNote, setEditingNote] = useState("");

  const startEditing = (id: string) => {
    const indemnite = indemnites?.find((item) => item.id === id);
    if (!indemnite) return;
    setEditingId(id);
    setEditingLibelle(indemnite.libelle);
    setEditingMontant(
      indemnite.montant === null ? "" : String(indemnite.montant),
    );
    setEditingRegle(indemnite.regle ?? "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingLibelle("");
    setEditingMontant("");
    setEditingRegle("");
  };

  const saveEditing = () => {
    if (!editingId || !editingLibelle.trim()) return;
    const parsedMontant = editingMontant.trim()
      ? Number(editingMontant)
      : undefined;
    if (parsedMontant === undefined && !editingRegle.trim()) return;
    updateIndemnite.mutate(
      {
        id: editingId,
        dto: {
          libelle: editingLibelle.trim(),
          ...(parsedMontant === undefined
            ? { montant: undefined }
            : { montant: parsedMontant }),
          regle: editingRegle.trim() || undefined,
        },
      },
      { onSuccess: cancelEditing },
    );
  };

  const startEditingAffectation = (id: string) => {
    const affectation = affectations?.find((item) => item.id === id);
    if (!affectation) return;
    setEditingAffectationId(id);
    setEditingDateFrom(affectation.dateFrom.slice(0, 10));
    setEditingDateTo(affectation.dateTo.slice(0, 10));
    setEditingQuantite(String(affectation.quantite));
    setEditingNote(affectation.note ?? "");
  };

  const cancelEditingAffectation = () => {
    setEditingAffectationId(null);
    setEditingDateFrom("");
    setEditingDateTo("");
    setEditingQuantite("1");
    setEditingNote("");
  };

  const saveEditingAffectation = () => {
    if (!editingAffectationId || !editingDateFrom || !editingDateTo) return;
    updateAffectation.mutate(
      {
        id: editingAffectationId,
        dto: {
          dateFrom: editingDateFrom,
          dateTo: editingDateTo,
          quantite: Number(editingQuantite) || 1,
          note: editingNote.trim() || undefined,
        },
      },
      { onSuccess: cancelEditingAffectation },
    );
  };

  const addIndemnite = () => {
    const parsedMontant = montant.trim() ? Number(montant) : undefined;
    if (!libelle.trim() || (parsedMontant === undefined && !regle.trim()))
      return;
    createIndemnite.mutate(
      {
        libelle: libelle.trim(),
        ...(parsedMontant === undefined ? {} : { montant: parsedMontant }),
        ...(regle.trim() ? { regle: regle.trim() } : {}),
      },
      {
        onSuccess: () => {
          setLibelle("");
          setMontant("");
          setRegle("");
        },
      },
    );
  };

  const addAffectation = () => {
    if (!userId || !indemniteId || !dateFrom || !dateTo) return;
    createAffectation.mutate({
      userId,
      indemniteId,
      dateFrom,
      dateTo,
      quantite: Number(quantite) || 1,
      note: note.trim() || undefined,
    });
  };

  return (
    <main className="min-h-[calc(100vh-65px)] bg-stone-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="border-b border-stone-200 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
            Paramétrage paie
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">
            Indemnités
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Gérez le catalogue puis affectez plusieurs indemnités aux ouvriers
            sur une période.
          </p>
        </header>

        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-stone-800">
            Catalogue des indemnités
          </h2>
          <div className="grid gap-3 md:grid-cols-[1.2fr_0.7fr_1.5fr_auto] md:items-end">
            <label className="text-xs font-medium text-stone-600">
              Libellé
              <Input
                value={libelle}
                onChange={(event) => setLibelle(event.target.value)}
                placeholder="Panier repas"
              />
            </label>
            <label className="text-xs font-medium text-stone-600">
              Montant
              <Input
                type="number"
                min="0"
                step="0.01"
                value={montant}
                onChange={(event) => setMontant(event.target.value)}
                placeholder="12,50"
              />
            </label>
            <label className="text-xs font-medium text-stone-600">
              Règle de calcul
              <Input
                value={regle}
                onChange={(event) => setRegle(event.target.value)}
                placeholder="Selon convention collective"
              />
            </label>
            <Button onClick={addIndemnite} disabled={createIndemnite.isPending}>
              Ajouter
            </Button>
          </div>
          <div className="mt-5 divide-y divide-stone-100 rounded-md border border-stone-200">
            {loadingIndemnites && (
              <p className="p-4 text-sm text-stone-500">Chargement…</p>
            )}
            {indemnites?.map((indemnite) => (
              <div
                key={indemnite.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3"
              >
                {editingId === indemnite.id ? (
                  <div className="grid w-full gap-2 md:grid-cols-[1.2fr_0.7fr_1.5fr_auto] md:items-end">
                    <Input
                      value={editingLibelle}
                      onChange={(event) =>
                        setEditingLibelle(event.target.value)
                      }
                      aria-label="Libellé de l'indemnité"
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editingMontant}
                      onChange={(event) =>
                        setEditingMontant(event.target.value)
                      }
                      aria-label="Montant de l'indemnité"
                    />
                    <Input
                      value={editingRegle}
                      onChange={(event) => setEditingRegle(event.target.value)}
                      aria-label="Règle de calcul"
                    />
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        title="Enregistrer la modification"
                        onClick={saveEditing}
                        disabled={updateIndemnite.isPending}
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Annuler la modification"
                        onClick={cancelEditing}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-medium text-stone-900">
                        {indemnite.libelle}
                      </p>
                      <p className="text-xs text-stone-500">
                        {indemnite.montant !== null
                          ? `${indemnite.montant.toFixed(2)} €`
                          : indemnite.regle}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Modifier l'indemnité"
                        onClick={() => startEditing(indemnite.id)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updateIndemnite.isPending}
                        onClick={() =>
                          updateIndemnite.mutate({
                            id: indemnite.id,
                            dto: { actif: !indemnite.actif },
                          })
                        }
                      >
                        {indemnite.actif ? "Désactiver" : "Réactiver"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-stone-800">
            Affecter une indemnité
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-medium text-stone-600">
              Ouvrier
              <select
                className="mt-1 h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
              >
                <option value="">Sélectionner</option>
                {ouvriers?.map((ouvrier) => (
                  <option key={ouvrier.id} value={ouvrier.id}>
                    {ouvrier.lastName} {ouvrier.firstName}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-stone-600">
              Indemnité
              <select
                className="mt-1 h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm"
                value={indemniteId}
                onChange={(event) => setIndemniteId(event.target.value)}
              >
                <option value="">Sélectionner</option>
                {indemnites
                  ?.filter((indemnite) => indemnite.actif)
                  .map((indemnite) => (
                    <option key={indemnite.id} value={indemnite.id}>
                      {indemnite.libelle}
                    </option>
                  ))}
              </select>
            </label>
            <label className="text-xs font-medium text-stone-600">
              Du
              <Input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </label>
            <label className="text-xs font-medium text-stone-600">
              Au
              <Input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </label>
            <label className="text-xs font-medium text-stone-600">
              Quantité
              <Input
                type="number"
                min="1"
                step="1"
                value={quantite}
                onChange={(event) => setQuantite(event.target.value)}
              />
            </label>
            <label className="text-xs font-medium text-stone-600 lg:col-span-2">
              Note
              <Input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Motif ou précision"
              />
            </label>
            <div className="flex items-end">
              <Button
                onClick={addAffectation}
                disabled={createAffectation.isPending}
              >
                Affecter
              </Button>
            </div>
          </div>
        </section>

        <section className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-stone-100 text-left text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th className="p-3">Ouvrier</th>
                <th className="p-3">Indemnité</th>
                <th className="p-3">Période</th>
                <th className="p-3">Quantité</th>
                <th className="p-3">Traçabilité</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {loadingAffectations && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-stone-500">
                    Chargement…
                  </td>
                </tr>
              )}
              {affectations?.map((affectation) =>
                editingAffectationId === affectation.id ? (
                  <tr
                    key={affectation.id}
                    className="border-t border-stone-100"
                  >
                    <td className="p-3 font-medium">
                      {affectation.user.lastName} {affectation.user.firstName}
                    </td>
                    <td className="p-3">{affectation.indemnite.libelle}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Input
                          type="date"
                          value={editingDateFrom}
                          onChange={(event) =>
                            setEditingDateFrom(event.target.value)
                          }
                        />
                        <Input
                          type="date"
                          value={editingDateTo}
                          onChange={(event) =>
                            setEditingDateTo(event.target.value)
                          }
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <Input
                        className="w-20"
                        type="number"
                        min="1"
                        step="1"
                        value={editingQuantite}
                        onChange={(event) =>
                          setEditingQuantite(event.target.value)
                        }
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        value={editingNote}
                        onChange={(event) => setEditingNote(event.target.value)}
                        placeholder="Note"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          title="Enregistrer la modification"
                          onClick={saveEditingAffectation}
                          disabled={updateAffectation.isPending}
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Annuler la modification"
                          onClick={cancelEditingAffectation}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={affectation.id}
                    className="border-t border-stone-100"
                  >
                    <td className="p-3 font-medium">
                      {affectation.user.lastName} {affectation.user.firstName}
                    </td>
                    <td className="p-3">{affectation.indemnite.libelle}</td>
                    <td className="p-3">
                      {new Date(affectation.dateFrom).toLocaleDateString(
                        "fr-FR",
                      )}{" "}
                      -{" "}
                      {new Date(affectation.dateTo).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-3">{affectation.quantite}</td>
                    <td className="p-3 text-xs text-stone-500">
                      {affectation.createdBy.lastName}
                      {affectation.note ? ` · ${affectation.note}` : ""}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Modifier l'affectation"
                          onClick={() =>
                            startEditingAffectation(affectation.id)
                          }
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Retirer l'affectation"
                          onClick={() =>
                            deleteAffectation.mutate(affectation.id)
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
