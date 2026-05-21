import { AuditAction } from "../constants/enums.js";

//allowed fields to be audited for changes. Changes to these fields will be recorded in the audit log with old/new values. Internal fields like IDs are not included.
const ISSUE_AUDITABLE_FIELDS = ["title", "description", "status", "priority", "severity", "dueDate", "resolvedAt", "assigneeId"];

// Normalize a field value to a comparable string (null stays null)
const normalize = (val) => {
  if (val === null || val === undefined) return null;
  if (val instanceof Date) return val.toISOString();
  return String(val);
};

//remove internal fields and relations from issue object before sending to FE or recording in audit logs.
const safeSnapshot = ({ id, createdById, assigneeId, ...rest }) => rest;

//builds an audit log entry for issue creation. The newValue contains a snapshot of the created issue for reference.
export function buildCreateLog(issue, performedById) {
  return {
    entity: "Issue",
    entityId: issue.id,
    entityUuid: issue.uuid,
    action: AuditAction.CREATE,
    field: null,
    oldValue: null,
    newValue: JSON.stringify(safeSnapshot(issue)),
    performedById,
  };
}

//returns one entry per changed field. Empty array if nothing changed.
export function buildUpdateLogs(oldIssue, newIssue, performedById) {
  const logs = [];
  for (const field of ISSUE_AUDITABLE_FIELDS) {
    let oldStr, newStr;

    //assigneeId, store the assignee UUID instead of the internal id
    if (field === "assigneeId") {
      oldStr = oldIssue.assignee?.uuid ?? null;
      newStr = newIssue.assignee?.uuid ?? null;
    } else {
      oldStr = normalize(oldIssue[field]);
      newStr = normalize(newIssue[field]);
    }

    if (oldStr !== newStr) {
      logs.push({
        entity: "Issue",
        entityId: newIssue.id,
        entityUuid: newIssue.uuid,
        action: AuditAction.UPDATE,
        field,
        oldValue: oldStr,
        newValue: newStr,
        performedById,
      });
    }
  }
  return logs;
}

//records the soft-delete event
export function buildDeleteLog(issue, performedById) {
  return {
    entity: "Issue",
    entityId: issue.id,
    entityUuid: issue.uuid,
    action: AuditAction.DELETE,
    field: null,
    oldValue: JSON.stringify(safeSnapshot(issue)),
    newValue: null,
    performedById,
  };
}
