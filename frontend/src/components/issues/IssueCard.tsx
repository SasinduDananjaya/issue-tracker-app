import { format, isPast } from "date-fns";
import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Calendar, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import PriorityBadge from "@/components/common/PriorityBadge";
import UserAvatar from "@/components/common/UserAvatar";
import IssueActionsMenu from "./IssueActionsMenu";
import { PRIORITY_LABELS } from "@/lib/constants";
import type { Issue } from "@/types/issueTypes";
import SeverityBadge from "../common/SeverityBadge";

interface IssueCardProps {
  issue: Issue;
  onEdit: (issue: Issue) => void;
  onView: (issue: Issue) => void;
  compact?: boolean;
}

const IssueCard = ({ issue, onEdit, onView, compact = false }: IssueCardProps) => {
  const isOverdue = issue.dueDate && issue.status !== "RESOLVED" && issue.status !== "CLOSED" && isPast(new Date(issue.dueDate));
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: issue.uuid, data: { issue } });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="touch-none cursor-grab active:cursor-grabbing">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: isDragging ? 0.3 : 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        whileHover={!isDragging ? { y: -2 } : undefined}
      >
        <Card
          className={`bg-white hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-primary-200 ${compact ? "p-3" : "p-4"}`}
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
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <SeverityBadge severity={issue.severity} />
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-primary text-white" arrowClassName="bg-primary fill-primary" side="top">
                Severity: {issue.severity}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <PriorityBadge priority={issue.priority} />
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-primary text-white" arrowClassName="bg-primary fill-primary" side="top">
                Priority: {PRIORITY_LABELS[issue.priority]}
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center justify-between mt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5">
                  {issue.assignee ? (
                    <UserAvatar user={issue.assignee} size="sm" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-blue-200">
                      <User className="text-primary" size="sm" />
                    </div>
                  )}
                  <span className="text-xs text-gray-400">{issue.assignee?.name}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-primary text-white" arrowClassName="bg-primary fill-primary" side="bottom">
                {issue.assignee ? `Assigned to: ${issue.assignee.name}` : "Unassigned"}
              </TooltipContent>
            </Tooltip>

            {issue.dueDate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                    <Calendar className="w-3 h-3" />
                    {format(new Date(issue.dueDate), "MMM d")}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-primary text-white" arrowClassName="bg-primary fill-primary" side="bottom">
                  {isOverdue ? "Overdue · " : "Due: "}
                  {format(new Date(issue.dueDate), "MMM d, yyyy")}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default IssueCard;
