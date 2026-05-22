import { useCallback } from "react";
import { Loader2, InboxIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_DOT_COLORS } from "@/lib/constants";
import useIssues from "@/hooks/useIssues";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import IssueCard from "./IssueCard";
import type { Issue, IssueFilters, IssueStatus } from "@/types/issueTypes";

interface KanbanColumnProps {
  status: IssueStatus;
  filters: IssueFilters;
  onEdit: (issue: Issue) => void;
  onView: (issue: Issue) => void;
}

const COLUMN_BG: Record<IssueStatus, string> = {
  OPEN: "bg-blue-50/60",
  IN_PROGRESS: "bg-purple-50/60",
  RESOLVED: "bg-green-50/60",
  CLOSED: "bg-gray-50/60",
};

const KanbanColumn = ({ status, filters, onEdit, onView }: KanbanColumnProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useIssues(status, filters);

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sentinelRef = useIntersectionObserver(handleIntersect);

  const issues = data?.pages.flatMap((p) => p.issues) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className={cn("flex flex-col rounded-xl min-w-70 max-w-[320px] w-full", COLUMN_BG[status])}>
      {/* column header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-white/60">
        <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", STATUS_DOT_COLORS[status])} />
        <span className="text-sm font-semibold text-gray-700">{STATUS_LABELS[status]}</span>
        <span className="ml-auto text-xs font-medium bg-white text-gray-500 px-2 py-0.5 rounded-full border">{isLoading ? "…" : total}</span>
      </div>

      {/* scrollable cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[calc(100vh-240px)]">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <InboxIcon className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">No issues</p>
          </div>
        ) : (
          <>
            {issues.map((issue) => (
              <IssueCard key={issue.uuid} issue={issue} onEdit={onEdit} onView={onView} compact />
            ))}
            {/* infinite scroll */}
            <div ref={sentinelRef} className="h-1" />
            {isFetchingNextPage && (
              <div className="flex justify-center py-3">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
