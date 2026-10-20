import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

type RetryableRequest = {
  _retry?: boolean;
  url?: string;
};

let refreshRequest: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const request = error.config as RetryableRequest | undefined;
    if (!request || request._retry || request.url === "/auth/web/refresh") {
      useAuthStore.getState().clearAuth();
      window.dispatchEvent(new Event("auth:expired"));
      return Promise.reject(error);
    }

    request._retry = true;
    refreshRequest ??= api.post("/auth/web/refresh").then(() => undefined);

    try {
      await refreshRequest;
      return api.request(request);
    } catch {
      useAuthStore.getState().clearAuth();
      window.dispatchEvent(new Event("auth:expired"));
      return Promise.reject(error);
    } finally {
      refreshRequest = null;
    }
  },
);
