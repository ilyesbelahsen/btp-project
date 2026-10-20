"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginFormData } from "@/features/auth/schemas";

type ApiError = {
  response?: { data?: { message?: string } };
};

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: LoginFormData) =>
      authService.login(email, password),
    onSuccess: ({ user }) => {
      setAuth(user);
      router.push("/dashboard");
    },
  });
}

export type { ApiError };
