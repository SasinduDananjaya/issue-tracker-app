import { apiClient } from "./client";
import type { Issue } from "@/types/issueTypes";
import type { PaginatedIssues, IssueStats, IssueFilters, AuditLog, CreateIssuePayload, UpdateIssuePayload } from "@/types";

export const listIssues = async (filters: IssueFilters = {}, page = 1, limit = 20): Promise<PaginatedIssues> => {
  const params = { ...filters, page, limit };
  const { data } = await apiClient.get("/issues", { params });
  return data;
};

export const getIssue = async (uuid: string): Promise<Issue> => {
  const { data } = await apiClient.get(`/issues/${uuid}`);
  return data;
};

export const createIssue = async (payload: CreateIssuePayload): Promise<Issue> => {
  const { data } = await apiClient.post("/issues", payload);
  return data;
};

export const updateIssue = async (uuid: string, payload: UpdateIssuePayload): Promise<Issue> => {
  const { data } = await apiClient.put(`/issues/${uuid}`, payload);
  return data;
};

export const deleteIssue = async (uuid: string): Promise<void> => {
  await apiClient.delete(`/issues/${uuid}`);
};

export const getIssueStats = async (): Promise<IssueStats> => {
  const { data } = await apiClient.get("/issues/stats");
  return data;
};

export const getAuditLogs = async (uuid: string): Promise<AuditLog[]> => {
  const { data } = await apiClient.get(`/issues/${uuid}/audit`);
  return data.logs;
};
