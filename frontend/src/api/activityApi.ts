import { apiClient } from "./client";
import type { PaginatedActivity } from "@/types";

//activity api client function to fetch paginated activity logs
export const getActivityLogs = async (page = 1, limit = 20): Promise<PaginatedActivity> => {
  const { data } = await apiClient.get("/activity", { params: { page, limit } });
  return data;
};
