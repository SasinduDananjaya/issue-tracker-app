import { format, isPast } from "date-fns";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import UserAvatar from "@/components/common/UserAvatar";
import IssueActionsMenu from "./IssueActionsMenu";
import type { Issue } from "@/types/issueTypes";

interface IssueCardProps {
  issue: Issue;
  onEdit: (issue: Issue) => void;
  onView: (issue: Issue) => void;
  compact?: boolean;
}

//card for each issue in the list with title and description
const IssueCard = ({ issue, onEdit, onView, compact = false }: IssueCardProps) => {
  const isOverdue = issue.dueDate && issue.status !== "RESOLVED" && issue.status !== "CLOSED" && isPast(new Date(issue.dueDate));

  return (
    <Card
      className={`bg-white hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-purple-200 ${compact ? "p-3" : "p-4"}`}
      onClick={() => onView(issue)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">{issue.title}</h3>
        <div onClick={(e) => e.stopPropagation()}>
          <IssueActionsMenu issue={issue} onEdit={onEdit} />
        </div>
      </div>

      {!compact && issue.description && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{issue.description}</p>}

      <div className="flex flex-wrap gap-1.5 mt-3">
        <StatusBadge status={issue.status} />
        <PriorityBadge priority={issue.priority} />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          {issue.assignee ? <UserAvatar user={issue.assignee} size="sm" /> : <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-200" />}
          <span className="text-xs text-gray-400">{issue.createdBy.name}</span>
        </div>

        {issue.dueDate && (
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
            <Calendar className="w-3 h-3" />
            {format(new Date(issue.dueDate), "MMM d")}
          </div>
        )}
      </div>
    </Card>
  );
};

export default IssueCard;
