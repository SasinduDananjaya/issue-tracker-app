import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Pencil, Loader2, Clock, User, AlertCircle, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import SeverityBadge from "@/components/common/SeverityBadge";
import UserAvatar from "@/components/common/UserAvatar";
import { getAuditLogs } from "@/api/issueApi";
import { AUDIT_LABELS } from "@/lib/constants";
import type { AuditLog } from "@/types";
import type { Issue } from "@/types/issueTypes";

interface IssueDetailProps {
  issue: Issue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (issue: Issue) => void;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const formatFieldName = (field: string) =>
  field
    .replace(/(?:Id|Uuid)$/i, "")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (s) => s.toUpperCase());

interface AuditEntryProps {
  log: AuditLog;
  issue: Issue;
}

const AuditEntry = ({ log, issue }: AuditEntryProps) => {
  const resolveValue = (val: string | null | undefined) => {
    if (!val) return "-";
    if (!UUID_RE.test(val)) return val;
    if (val === issue.assignee?.uuid) return issue.assignee.email;
    if (val === issue.createdBy.uuid) return issue.createdBy.email;
    return "-";
  };

  return (
    <div className="flex gap-3 text-sm">
      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
        <Clock className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900">{log.performedBy.name}</span>
          <span className="text-gray-500">{AUDIT_LABELS[log.action] ?? log.action}</span>
          <span className="text-xs text-gray-400">{format(new Date(log.performedAt), "MMM d, yyyy · HH:mm")}</span>
        </div>
        {log.field && (
          <p className="mt-1 text-xs text-gray-500 break-all">
            <span>{formatFieldName(log.field)}</span>:{" "}
            {log.oldValue && (
              <>
                <span className="line-through text-gray-400">{resolveValue(log.oldValue)}</span>
                <ArrowRight className="inline mx-1 w-3 h-3 text-gray-400" />
              </>
            )}
            <span className="text-gray-700">{resolveValue(log.newValue)}</span>
          </p>
        )}
      </div>
    </div>
  );
};

const Prop = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={`space-y-1 min-w-0 overflow-hidden ${className}`}>
    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
    {children}
  </div>
);

const IssueDetail = ({ issue, open, onOpenChange, onEdit }: IssueDetailProps) => {
  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    queryKey: ["audit", issue?.uuid],
    queryFn: () => getAuditLogs(issue!.uuid),
    enabled: open && !!issue,
  });

  if (!issue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl flex flex-col p-0 gap-0 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b shrink-0 pr-14">
          <DialogTitle className="text-base font-semibold text-gray-900 leading-snug">{issue.title}</DialogTitle>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 shrink-0 bg-blue-600 text-white hover:text-white hover:bg-blue-700"
            onClick={() => {
              onOpenChange(false);
              onEdit(issue);
            }}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Description */}
          {issue.description ? (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{issue.description}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No description provided.</p>
          )}

          {/* Properties grid */}
          <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-4 grid grid-cols-6 gap-x-6 gap-y-5">
            {/* Row 1: Status, Priority, Severity */}
            <Prop label="Status" className="col-span-2">
              <StatusBadge status={issue.status} />
            </Prop>
            <Prop label="Priority" className="col-span-2">
              <PriorityBadge priority={issue.priority} />
            </Prop>
            <Prop label="Severity" className="col-span-2">
              <SeverityBadge severity={issue.severity} />
            </Prop>

            {/* Row 2: Assignee, Created by  */}
            <Prop label="Assignee" className="col-span-6">
              {issue.assignee ? (
                <div className="flex items-start gap-2 min-w-0">
                  <UserAvatar user={issue.assignee} size="sm" className="shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 wrap-break-word">{issue.assignee.name}</p>
                    <p className="text-xs text-gray-400 break-all">{issue.assignee.email}</p>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Unassigned</span>
              )}
            </Prop>
            <Prop label="Created by" className="col-span-6">
              <div className="flex items-start gap-2 min-w-0">
                <User className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-900 wrap-break-word">{issue.createdBy.name}</p>
                  <p className="text-xs text-gray-400 break-all">{issue.createdBy.email}</p>
                </div>
              </div>
            </Prop>

            {/* Row 3: Created, Updated, Due date*/}
            <Prop label="Created" className="col-span-2">
              <span className="text-sm text-gray-700">{format(new Date(issue.createdAt), "MMM d, yyyy")}</span>
            </Prop>
            <Prop label="Updated" className="col-span-2">
              <span className="text-sm text-gray-700">{format(new Date(issue.updatedAt), "MMM d, yyyy")}</span>
            </Prop>
            <Prop label="Due date" className="col-span-2">
              <span className="text-sm text-gray-700">{issue.dueDate ? format(new Date(issue.dueDate), "MMM d, yyyy") : "-"}</span>
            </Prop>

            {issue.resolvedAt && (
              <Prop label="Resolved" className="col-span-2">
                <span className="text-sm text-green-700">{format(new Date(issue.resolvedAt), "MMM d, yyyy")}</span>
              </Prop>
            )}
          </div>

          {/* Activity log */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Activity Log</p>
            {auditLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : !auditLogs?.length ? (
              <div className="flex flex-col items-center py-10 text-gray-400">
                <AlertCircle className="w-7 h-7 mb-2 opacity-40" />
                <p className="text-sm">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {auditLogs.slice(0, 3).map((log: AuditLog) => (
                  <AuditEntry key={log.uuid} log={log} issue={issue} />
                ))}
                {auditLogs.length > 3 && <p className="text-xs text-gray-400 text-center pt-1">Showing 3 of {auditLogs.length} entries</p>}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IssueDetail;
