import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Pencil, Loader2, Clock, User, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

//detailed view issue in a dialog with tabs for details and activity log
const AuditEntry = ({ log }: { log: AuditLog }) => (
  <div className="flex gap-3 text-sm">
    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
      <Clock className="w-3.5 h-3.5 text-purple-600" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-medium text-gray-900">{log.performedBy.name}</span>
        <span className="text-gray-500">{AUDIT_LABELS[log.action] ?? log.action}</span>
        <span className="text-xs text-gray-400">{format(new Date(log.performedAt), "MMM d, yyyy HH:mm")}</span>
      </div>
      {log.field && (
        <p className="mt-1 text-xs text-gray-500">
          <span className="capitalize">{log.field}</span>: <span className="line-through text-gray-400">{log.oldValue ?? "—"}</span>
          {" → "}
          <span className="text-gray-700">{log.newValue ?? "—"}</span>
        </p>
      )}
    </div>
  </div>
);

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-3 py-2">
    <span className="text-xs text-gray-500 w-24 shrink-0 mt-0.5">{label}</span>
    <div className="flex-1">{children}</div>
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
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={issue.status} />
                <PriorityBadge priority={issue.priority} />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-900 leading-snug">{issue.title}</DialogTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5"
              onClick={() => {
                onOpenChange(false);
                onEdit(issue);
              }}
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-3 w-fit">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-y-auto px-6 pb-6 mt-0">
            {issue.description && <p className="text-sm text-gray-700 mt-4 leading-relaxed">{issue.description}</p>}
            <Separator className="my-4" />
            <div className="divide-y divide-gray-100">
              <DetailRow label="Status">
                <StatusBadge status={issue.status} />
              </DetailRow>
              <DetailRow label="Priority">
                <PriorityBadge priority={issue.priority} />
              </DetailRow>
              <DetailRow label="Severity">
                <SeverityBadge severity={issue.severity} />
              </DetailRow>
              <DetailRow label="Assignee">
                {issue.assignee ? (
                  <div className="flex items-center gap-2">
                    <UserAvatar user={issue.assignee} size="sm" />
                    <span className="text-sm text-gray-900">{issue.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Unassigned</span>
                )}
              </DetailRow>
              <DetailRow label="Created by">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-900">{issue.createdBy.name}</span>
                </div>
              </DetailRow>
              <DetailRow label="Due date">
                <span className="text-sm text-gray-700">{issue.dueDate ? format(new Date(issue.dueDate), "MMMM d, yyyy") : "—"}</span>
              </DetailRow>
              <DetailRow label="Created">
                <span className="text-sm text-gray-700">{format(new Date(issue.createdAt), "MMMM d, yyyy HH:mm")}</span>
              </DetailRow>
              <DetailRow label="Updated">
                <span className="text-sm text-gray-700">{format(new Date(issue.updatedAt), "MMMM d, yyyy HH:mm")}</span>
              </DetailRow>
              {issue.resolvedAt && (
                <DetailRow label="Resolved">
                  <span className="text-sm text-green-700">{format(new Date(issue.resolvedAt), "MMMM d, yyyy HH:mm")}</span>
                </DetailRow>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="flex-1 overflow-y-auto px-6 pb-6 mt-0">
            {auditLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : !auditLogs || auditLogs.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-400">
                <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No activity yet</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {auditLogs.map((log) => (
                  <AuditEntry key={log.uuid} log={log} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default IssueDetail;
