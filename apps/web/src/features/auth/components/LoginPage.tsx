import { HardHat } from "lucide-react";
import { LoginForm } from "./LoginForm";

export function LoginPage() {
  return (
    <div className="grid min-h-screen bg-stone-50 lg:grid-cols-[0.9fr_1.1fr]">
      {/* Panneau gauche — identité de marque */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-12 text-white lg:flex">
        <div className="absolute inset-y-0 right-0 w-1 bg-orange-500" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_0%,transparent_49%,rgba(249,115,22,0.35)_50%,transparent_51%,transparent_100%)] [background-size:28px_28px]" />
        <div className="flex items-center gap-3">
          <div className="relative rounded-lg bg-orange-500 p-2.5 text-zinc-950">
            <HardHat className="size-6" />
          </div>
          <span className="relative text-lg font-bold tracking-tight">
            BTP Manager
          </span>
        </div>

        <blockquote className="relative max-w-md space-y-3">
          <div className="h-1 w-10 bg-orange-500" />
          <p className="text-2xl font-medium leading-relaxed text-zinc-100">
            &ldquo;Gérez vos chantiers, validez les pointages et suivez votre
            rentabilité en temps réel.&rdquo;
          </p>
          <footer className="text-sm font-medium text-zinc-400">
            Plateforme de gestion BTP
          </footer>
        </blockquote>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-16">
        <div className="w-full max-w-sm space-y-8">
          {/* Header mobile only */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="rounded-lg bg-orange-500 p-3 text-zinc-950 shadow-sm">
              <HardHat className="size-7" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
              BTP Manager
            </h1>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
              Espace professionnel
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-stone-950">
              Connexion
            </h2>
            <p className="text-sm text-stone-500">
              Accédez à votre espace de gestion
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
