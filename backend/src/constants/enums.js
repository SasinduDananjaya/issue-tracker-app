//enum values for issue status, priority, severity and audit actions

export const IssueStatus = Object.freeze({
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
});

export const IssuePriority = Object.freeze({
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
});

export const IssueSeverity = Object.freeze({
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
});

export const AuditAction = Object.freeze({
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
});

//statuses that trigger resolvedAt to be auto-set
export const RESOLVED_STATUSES = new Set([IssueStatus.RESOLVED, IssueStatus.CLOSED]);
