import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { authService } from "@/src/services/auth.service";
import { useAuthStore } from "@/src/stores/auth.store";
import { logger } from "@/src/utils/logger";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.replace("/(tabs)");
    },
    onError: (err: unknown) => {
      logger.error("Login failed", err);
    },
  });
}

export function useLogout() {
  const { refreshToken, clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await authService.logout(refreshToken).catch((err: unknown) => {
          logger.warn("Server logout failed", err);
        });
      }
    },
    onSuccess: () => {
      clearAuth();
      router.replace("/(auth)/login");
    },
  });
}
