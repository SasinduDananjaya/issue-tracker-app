import { useState } from "react";
import { motion } from "framer-motion";
import { format, isPast } from "date-fns";
import { Loader2, InboxIcon, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import Pagination from "@/components/common/Pagination";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import SeverityBadge from "@/components/common/SeverityBadge";
import UserAvatar from "@/components/common/UserAvatar";
import IssueCard from "./IssueCard";
import IssueActionsMenu from "./IssueActionsMenu";
import useIssueList from "@/hooks/useIssueList";
import type { Issue, IssueFilters } from "@/types/issueTypes";

interface IssueListProps {
  filters: IssueFilters;
  onEdit: (issue: Issue) => void;
  onView: (issue: Issue) => void;
}

//list of issues with pagination
const IssueList = ({ filters, onEdit, onView }: IssueListProps) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useIssueList(filters, page);

  const issues = data?.issues ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto">
      {/* desktop table */}
      <Card className="overflow-hidden border border-gray-200 bg-white hidden md:block">
        <div className="grid grid-cols-[2fr_100px_90px_90px_140px_110px_110px_44px] gap-3 px-4 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>Title</span>
          <span>Status</span>
          <span>Priority</span>
          <span>Severity</span>
          <span>Assignee</span>
          <span>Due Date</span>
          <span>Created</span>
          <span />
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-4 py-3.5 animate-pulse flex gap-4 items-center">
                <div className="h-4 bg-gray-100 rounded flex-2" />
                <div className="h-4 bg-gray-100 rounded w-20" />
                <div className="h-4 bg-gray-100 rounded w-16" />
                <div className="h-4 bg-gray-100 rounded w-16" />
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-4 bg-gray-100 rounded w-20" />
                <div className="h-4 bg-gray-100 rounded w-20" />
              </div>
            ))
          ) : issues.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <InboxIcon className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No issues found</p>
            </div>
          ) : (
            issues.map((issue, i) => {
              const isOverdue = issue.dueDate && issue.status !== "RESOLVED" && issue.status !== "CLOSED" && isPast(new Date(issue.dueDate));
              return (
                <motion.div
                  key={issue.uuid}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="grid grid-cols-[2fr_100px_90px_90px_140px_110px_110px_44px] gap-3 px-4 py-3.5 hover:bg-gray-50 cursor-pointer items-center transition-colors"
                  onClick={() => onView(issue)}
                >
                  <span className="text-sm font-medium text-gray-900 truncate">{issue.title}</span>
                  <StatusBadge status={issue.status} />
                  <PriorityBadge priority={issue.priority} />
                  <SeverityBadge severity={issue.severity} />
                  <div className="flex items-center gap-1.5 min-w-0">
                    {issue.assignee ? (
                      <>
                        <UserAvatar user={issue.assignee} size="sm" />
                        <span className="text-xs text-gray-500 truncate">{issue.assignee.name}</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">Unassigned</span>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-500"}`}>
                    {issue.dueDate ? (
                      <>
                        <Calendar className="w-3 h-3" />
                        {format(new Date(issue.dueDate), "MMM d, yyyy")}
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{format(new Date(issue.createdAt), "MMM d, yyyy")}</span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <IssueActionsMenu issue={issue} onEdit={onEdit} />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </Card>

      {/* cards view in mobile */}
      <div className="md:hidden space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <InboxIcon className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">No issues found</p>
          </div>
        ) : (
          issues.map((issue) => <IssueCard key={issue.uuid} issue={issue} onEdit={onEdit} onView={onView} />)
        )}
      </div>

      <div className="pb-4">
        <Pagination page={page} totalPages={totalPages} total={data?.total} pageSize={20} itemLabel="issues" isLoading={isFetching} onChange={setPage} />
      </div>
    </div>
  );
};

export default IssueList;
