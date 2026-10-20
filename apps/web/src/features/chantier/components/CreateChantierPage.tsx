import { CreateChantierForm } from "@/features/chantier/components/CreateChantierForm";

export function CreateChantierPage() {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-50/70 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-7 border-b border-stone-200 pb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
            Création opérationnelle
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
            Nouveau chantier
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            Renseignez les informations du chantier
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          <CreateChantierForm />
        </div>
      </div>
    </div>
  );
}
