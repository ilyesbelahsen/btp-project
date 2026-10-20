"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginSchema, type LoginFormData } from "@/features/auth/schemas";
import { useLogin } from "@/features/auth/hooks/useLogin";

export function LoginForm() {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const isPending = isSubmitting || loginMutation.isPending;

  const errorMessage = loginMutation.isError
    ? "Email ou mot de passe incorrect"
    : null;

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onError: () => {
        reset({ email: data.email, password: "" });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-stone-700">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="patron@entreprise.fr"
          aria-invalid={!!errors.email}
          disabled={isPending}
          className="h-10 border-stone-200 bg-stone-50 focus-visible:border-orange-500 focus-visible:ring-orange-200"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-stone-700"
        >
          Mot de passe
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          disabled={isPending}
          className="h-10 border-stone-200 bg-stone-50 focus-visible:border-orange-500 focus-visible:ring-orange-200"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="h-10 w-full bg-orange-600 text-white hover:bg-orange-700"
        size="lg"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Connexion…
          </>
        ) : (
          "Se connecter"
        )}
      </Button>
    </form>
  );
}
