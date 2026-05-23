import type { User } from "./userTypes";

export type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IssueSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Issue {
  uuid: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity;
  dueDate?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  assignee?: User;
}

export interface IssueStats {
  OPEN: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  CLOSED: number;
}

export interface IssueFilters {
  search?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  severity?: IssueSeverity;
  createdBy?: string;
  assignee?: string;
  updatedBy?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface PaginatedIssues {
  issues: Issue[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
