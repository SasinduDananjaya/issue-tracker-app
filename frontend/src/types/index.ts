import type { User } from "./userTypes";
import type { IssueStatus, IssuePriority, IssueSeverity } from "./issueTypes";

export interface AuditLog {
  uuid: string;
  entity: string;
  entityUuid: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  field?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  performedBy: User;
  performedAt: string;
}

export interface GlobalAuditLog extends AuditLog {
  issue: { uuid: string; title: string };
}

export interface PaginatedActivity {
  logs: GlobalAuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthTokens {
  accessToken: string;
  user: User;
}

export interface CreateIssuePayload {
  title: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  severity?: IssueSeverity;
  dueDate?: string;
  assigneeUuid?: string;
}

export interface UpdateIssuePayload extends Omit<Partial<CreateIssuePayload>, "assigneeUuid"> {
  assigneeUuid?: string | null;
}

export type { User } from "./userTypes";

export type { IssueStatus, IssuePriority, IssueSeverity, Issue, IssueStats, IssueFilters, PaginatedIssues } from "./issueTypes";
