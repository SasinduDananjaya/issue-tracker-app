import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import type { IssueStatus } from "@/types/issueTypes";

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

//badge to display issue status with different colors and labels
const StatusBadge = ({ status, className }: StatusBadgeProps) => (
  <Badge variant="outline" className={cn("text-xs font-medium border", STATUS_COLORS[status], className)}>
    {STATUS_LABELS[status]}
  </Badge>
);

export default StatusBadge;
