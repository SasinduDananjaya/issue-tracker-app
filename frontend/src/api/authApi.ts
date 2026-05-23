import { apiClient } from "./client";
import type { User } from "@/types/userTypes";
import type { AuthTokens } from "@/types";

//auth api client functions
export const login = async (email: string, password: string): Promise<AuthTokens> => {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data;
};

export const register = async (name: string, email: string, password: string, companyCode?: string): Promise<AuthTokens> => {
  const { data } = await apiClient.post("/auth/register", { name, email, password, ...(companyCode && { companyCode }) });
  return data;
};

// No token arg — the httpOnly cookie is sent automatically by the browser
export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

export const getMe = async (): Promise<User> => {
  const { data } = await apiClient.get("/auth/me");
  return data;
};