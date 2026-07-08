import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request : injecter le Bearer token ────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response : refresh automatique sur 401 ───────────────────────────────────
type PendingRequest = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
let pendingQueue: PendingRequest[] = [];

const drainQueue = (err: unknown, token: string | null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    err ? reject(err) : resolve(token!),
  );
  pendingQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Ignorer les erreurs non-401, les retries déjà effectués,
    // et l'endpoint refresh lui-même pour éviter les boucles.
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes("/auth/")
    ) {
      return Promise.reject(error);
    }

    const { refreshToken } = useAuthStore.getState();

    if (!refreshToken) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    // Si un refresh est déjà en cours, mettre la requête en file d'attente
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // Appel direct sans passer par apiClient pour éviter la récursion
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      useAuthStore
        .getState()
        .setAuth(data.user, data.accessToken, data.refreshToken);

      drainQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      drainQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
