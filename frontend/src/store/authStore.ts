import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

//zustand store for authentication state, including user info and access token
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => {
        set({ user, accessToken });
      },
      setAccessToken: (accessToken) => {
        set({ accessToken });
      },
      clearAuth: () => {
        set({ user: null, accessToken: null });
      },
    }),
    // Only persist the user identity so ProtectedRoute knows to show the app on reload.
    //refreshed via the httpOnly refresh token cookie on page load.
    { name: "auth-storage", partialize: (s) => ({ user: s.user }) },
  ),
);
