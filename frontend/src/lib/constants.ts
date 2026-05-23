import type { IssueStatus, IssuePriority, IssueSeverity, AuditLog } from "@/types";

//constants for issue status, priority, severity colors and labels, column order and audit log labels
export const STATUS_COLORS: Record<IssueStatus, string> = {
  OPEN: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-primary-100 text-primary-900 border-primary-200",
  RESOLVED: "bg-success-50 text-success-700 border-success-700/30",
  CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
};

export const STATUS_DOT_COLORS: Record<IssueStatus, string> = {
  OPEN: "bg-blue-500",
  IN_PROGRESS: "bg-primary",
  RESOLVED: "bg-success",
  CLOSED: "bg-red-400",
};

export const STATUS_BORDER_COLORS: Record<IssueStatus, string> = {
  OPEN: "border-l-blue-500",
  IN_PROGRESS: "border-l-primary",
  RESOLVED: "border-l-success",
  CLOSED: "border-l-gray-400",
};

export const STATUS_CARD_COLORS: Record<IssueStatus, string> = {
  OPEN: "bg-blue-50 border-blue-200",
  IN_PROGRESS: "bg-primary-50 border-primary-200",
  RESOLVED: "bg-success-50 border-success-700/20",
  CLOSED: "bg-gray-50 border-gray-200",
};

export const STATUS_COUNT_ICON_COLORS: Record<IssueStatus, string> = {
  OPEN: "text-blue-600 bg-blue-100",
  IN_PROGRESS: "text-primary-900 bg-primary-100",
  RESOLVED: "text-success-700 bg-success-50",
  CLOSED: "text-gray-500 bg-gray-100",
};

export const PRIORITY_COLORS: Record<IssuePriority, string> = {
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
};

export const SEVERITY_COLORS: Record<IssueSeverity, string> = {
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
};

export const STATUS_LABELS: Record<IssueStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const SEVERITY_LABELS: Record<IssueSeverity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const COLUMN_ORDER: IssueStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export const ALL_STATUSES: IssueStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
export const ALL_PRIORITIES: IssuePriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const ALL_SEVERITIES: IssueSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const AUDIT_LABELS: Record<AuditLog["action"], string> = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
};
