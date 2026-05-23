import { useState } from "react";
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { toast } from "sonner";
import { COLUMN_ORDER, STATUS_LABELS } from "@/lib/constants";
import { updateIssue } from "@/api/issueApi";
import KanbanColumn from "./KanbanColumn";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import type { Issue, IssueFilters, IssueStatus, IssueStats, PaginatedIssues } from "@/types";

interface KanbanBoardProps {
  filters: IssueFilters;
  onEdit: (issue: Issue) => void;
  onView: (issue: Issue) => void;
}

type PendingDrop = { issue: Issue; targetStatus: IssueStatus };

const CONFIRM_ON_DROP: IssueStatus[] = ["RESOLVED", "CLOSED"];

//kanban board that renders the columns and handles drag and drop cards
const KanbanBoard = ({ filters, onEdit, onView }: KanbanBoardProps) => {
  const queryClient = useQueryClient();
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveIssue(active.data.current?.issue as Issue);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveIssue(null);
    if (!over) return;

    const issue = active.data.current?.issue as Issue;
    const targetStatus = over.id as IssueStatus;

    if (!issue || targetStatus === issue.status) return;

    if (CONFIRM_ON_DROP.includes(targetStatus)) {
      setPendingDrop({ issue, targetStatus });
    } else {
      commitDrop(issue, targetStatus);
    }
  };

  //instantly mutates the react query cache and returns snapshots for rollback.
  const applyOptimistic = (issue: Issue, targetStatus: IssueStatus) => {
    const sourceStatus = issue.status;
    const sourceKey = ["issues", "kanban", sourceStatus, filters];
    const targetKey = ["issues", "kanban", targetStatus, filters];
    const statsKey = ["issues", "stats"];

    const prevSource = queryClient.getQueryData<InfiniteData<PaginatedIssues>>(sourceKey);
    const prevTarget = queryClient.getQueryData<InfiniteData<PaginatedIssues>>(targetKey);
    const prevStats = queryClient.getQueryData<IssueStats>(statsKey);

    if (prevSource) {
      queryClient.setQueryData<InfiniteData<PaginatedIssues>>(sourceKey, {
        ...prevSource,
        pages: prevSource.pages.map((page) => ({
          ...page,
          issues: page.issues.filter((i) => i.uuid !== issue.uuid),
          total: Math.max(0, page.total - 1),
        })),
      });
    }

    if (prevTarget) {
      const moved = { ...issue, status: targetStatus };
      queryClient.setQueryData<InfiniteData<PaginatedIssues>>(targetKey, {
        ...prevTarget,
        pages: prevTarget.pages.map((page, idx) => (idx === 0 ? { ...page, issues: [moved, ...page.issues], total: page.total + 1 } : page)),
      });
    }

    if (prevStats) {
      queryClient.setQueryData<IssueStats>(statsKey, {
        ...prevStats,
        [sourceStatus]: Math.max(0, prevStats[sourceStatus] - 1),
        [targetStatus]: prevStats[targetStatus] + 1,
      });
    }

    return { prevSource, prevTarget, prevStats, sourceKey, targetKey, statsKey };
  };

  const commitDrop = async (issue: Issue, targetStatus: IssueStatus) => {
    setPendingDrop(null);

    const snapshots = applyOptimistic(issue, targetStatus);

    try {
      await updateIssue(issue.uuid, { status: targetStatus });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      toast.success(`Moved to ${STATUS_LABELS[targetStatus]}`);
    } catch {
      const { prevSource, prevTarget, prevStats, sourceKey, targetKey, statsKey } = snapshots;
      if (prevSource) queryClient.setQueryData(sourceKey, prevSource);
      if (prevTarget) queryClient.setQueryData(targetKey, prevTarget);
      if (prevStats) queryClient.setQueryData(statsKey, prevStats);
      toast.error("Failed to move issue - change has been reverted");
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-5 overflow-x-auto pb-4 h-full">
        {COLUMN_ORDER.map((status, index) => (
          <KanbanColumn
            key={status}
            index={index}
            status={status}
            filters={filters}
            onEdit={onEdit}
            onView={onView}
            isDimmed={!!filters.status && filters.status !== status}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeIssue && (
          <div className="rotate-1 opacity-95 w-70 cursor-grabbing">
            <div className="bg-white shadow-xl border border-primary-200 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{activeIssue.title}</h3>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <StatusBadge status={activeIssue.status} />
                <PriorityBadge priority={activeIssue.priority} />
              </div>
            </div>
          </div>
        )}
      </DragOverlay>

      {pendingDrop && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setPendingDrop(null)}
          title={pendingDrop.targetStatus === "RESOLVED" ? "Mark as Resolved?" : "Close Issue?"}
          description={
            pendingDrop.targetStatus === "RESOLVED"
              ? `Mark "${pendingDrop.issue.title}" as resolved? This signals the issue has been fixed.`
              : `Close "${pendingDrop.issue.title}"? Closed issues are considered done and won't appear in active views.`
          }
          confirmLabel={pendingDrop.targetStatus === "RESOLVED" ? "Mark Resolved" : "Close Issue"}
          variant={pendingDrop.targetStatus === "RESOLVED" ? "default" : "warning"}
          onConfirm={() => commitDrop(pendingDrop.issue, pendingDrop.targetStatus)}
        />
      )}
    </DndContext>
  );
};

export default KanbanBoard;
