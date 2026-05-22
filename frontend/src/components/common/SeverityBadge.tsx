import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SEVERITY_COLORS, SEVERITY_LABELS } from "@/lib/constants";
import type { IssueSeverity } from "@/types/issueTypes";

interface SeverityBadgeProps {
  severity: IssueSeverity;
  className?: string;
}

//badge to display issue severity with different colors and labels
const SeverityBadge = ({ severity, className }: SeverityBadgeProps) => (
  <Badge variant="outline" className={cn("text-xs font-medium border", SEVERITY_COLORS[severity], className)}>
    {SEVERITY_LABELS[severity]}
  </Badge>
);

export default SeverityBadge;
