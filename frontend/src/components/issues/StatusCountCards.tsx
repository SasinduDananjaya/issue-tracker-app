import { CircleDot, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COUNT_ICON_COLORS } from "@/lib/constants";
import useIssueStats from "@/hooks/useIssueStats";
import type { IssueStatus } from "@/types";

const ICONS: Record<IssueStatus, React.ElementType> = {
  OPEN: CircleDot,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle2,
  CLOSED: XCircle,
};

const CARD_STYLES: Record<IssueStatus, string> = {
  OPEN: "border-l-4 border-l-blue-500",
  IN_PROGRESS: "border-l-4 border-l-purple-500",
  RESOLVED: "border-l-4 border-l-green-500",
  CLOSED: "border-l-4 border-l-gray-400",
};

const STATUSES: IssueStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

//cards showing count of issues in each status for dashboard
const StatusCountCards = () => {
  const { data, isLoading } = useIssueStats();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STATUSES.map((status) => {
        const Icon = ICONS[status];
        const count = data?.[status] ?? 0;
        return (
          <Card key={status} className={cn("p-4 bg-white", CARD_STYLES[status])}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{STATUS_LABELS[status]}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? "—" : count}</p>
              </div>
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", STATUS_COUNT_ICON_COLORS[status])}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default StatusCountCards;
