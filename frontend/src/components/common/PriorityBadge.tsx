import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/constants";
import type { IssuePriority } from "@/types/issueTypes";

interface PriorityBadgeProps {
  priority: IssuePriority;
  className?: string;
}

//badge to display issue priority with different colors and labels
const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => (
  <Badge variant="outline" className={cn("text-xs font-medium border", PRIORITY_COLORS[priority], className)}>
    {PRIORITY_LABELS[priority]}
  </Badge>
);

export default PriorityBadge;
