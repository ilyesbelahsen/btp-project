"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser } from "@/features/auth/types";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "btp-auth",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
