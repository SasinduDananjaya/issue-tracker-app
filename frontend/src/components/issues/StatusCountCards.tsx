import { motion } from "framer-motion";
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
  IN_PROGRESS: "border-l-4 border-l-primary",
  RESOLVED: "border-l-4 border-l-success",
  CLOSED: "border-l-4 border-l-red-400",
};

const STATUSES: IssueStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const card = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
};

//dashboard cards that show count of issues in each status.
const StatusCountCards = () => {
  const { data, isLoading } = useIssueStats();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STATUSES.map((status) => {
        const Icon = ICONS[status];
        const count = data?.[status] ?? 0;
        return (
          <motion.div key={status} variants={card}>
            <Card className={cn("p-4 bg-white", CARD_STYLES[status])}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{STATUS_LABELS[status]}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? "-" : count}</p>
                </div>
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", STATUS_COUNT_ICON_COLORS[status])}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default StatusCountCards;
