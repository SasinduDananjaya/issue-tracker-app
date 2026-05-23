import { apiClient } from "./client";
import type { User } from "@/types/userTypes";

//user api client function to fetch organization members for dropdowns and filters
export const getOrgMembers = async (): Promise<User[]> => {
  const { data } = await apiClient.get("/users");
  return data.members;
};
