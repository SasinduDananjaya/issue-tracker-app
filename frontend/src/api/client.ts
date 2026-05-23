import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

//send the httpOnly refresh token cookie on every request
export const apiClient = axios.create({ baseURL: BACKEND_BASE_URL, withCredentials: true });

let isRefreshing = false;
let isLoggingOut = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    isLoggingOut = false; // reset after a fresh login restores the token
  }
  return config;
});

//response interceptor to handle 401 errors and token refresh
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = original.url?.includes("/auth/login") || original.url?.includes("/auth/register");
    if (error.response?.status !== 401 || original._retry || isLoggingOut || isAuthEndpoint) {
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }
    original._retry = true;
    isRefreshing = true;
    try {
      const { data } = await axios.post(`${BACKEND_BASE_URL}/auth/refresh`, undefined, { withCredentials: true });

      useAuthStore.getState().setAccessToken(data.accessToken);
      processQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(original);
    } catch (err) {
      isLoggingOut = true;
      processQueue(err, null);
      //clearAuth clears both the in-memory access token and the Zustand persist user state so ProtectedRoute re-renders and redirects to /login without a hard reload.
      useAuthStore.getState().clearAuth();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
