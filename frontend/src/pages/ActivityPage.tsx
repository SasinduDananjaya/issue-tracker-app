import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { History, Loader2, AlertCircle, Plus, Pencil, Trash2 } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import Pagination from "@/components/common/Pagination";
import { getActivityLogs } from "@/api/activityApi";
import { cn } from "@/lib/utils";
import type { GlobalAuditLog } from "@/types";

//activity page that displays a paginated list of all changes across the workspace with pagination
const ACTION_CONFIG = {
  CREATE: { label: "Created", icon: Plus, className: "bg-success-50 text-success-700 border-success-700/30" },
  UPDATE: { label: "Updated", icon: Pencil, className: "bg-primary-100 text-primary-900 border-primary-200" },
  DELETE: { label: "Deleted", icon: Trash2, className: "bg-red-100 text-red-700 border-red-200" },
} as const;

const formatField = (field: string) => field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const buildDescription = (log: GlobalAuditLog): string => {
  if (log.action === "CREATE") return "Issue created";
  if (log.action === "DELETE") return "Issue deleted";
  if (log.field) {
    const field = formatField(log.field);
    const from = log.oldValue ?? "-";
    const to = log.newValue ?? "-";
    return `${field}: "${from}" → "${to}"`;
  }
  return "Issue updated";
};

const ActionBadge = ({ action }: { action: GlobalAuditLog["action"] }) => {
  const { label, icon: Icon, className } = ACTION_CONFIG[action];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-2xl border text-xs font-medium", className)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

const LIMIT = 20;

const ActivityPage = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["activity", page],
    queryFn: () => getActivityLogs(page, LIMIT),
    placeholderData: (prev) => prev,
  });

  const emptyState = isLoading ? (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
    </div>
  ) : isError ? (
    <div className="flex flex-col items-center py-20 text-gray-400">
      <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
      <p className="text-sm">Failed to load activity</p>
    </div>
  ) : !data || data.logs.length === 0 ? (
    <div className="flex flex-col items-center py-20 text-gray-400">
      <History className="w-8 h-8 mb-2 opacity-30" />
      <p className="text-sm">No activity yet</p>
    </div>
  ) : null;

  const pagination = data && (
    <div className="px-4 py-3 border-t border-gray-100">
      <Pagination page={page} totalPages={data.totalPages} total={data.total} pageSize={LIMIT} itemLabel="events" onChange={setPage} />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="p-4 sm:p-6 max-w-7xl mx-auto"
      >
        {/* page header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
            <History className="w-4 h-4 text-primary-900" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-primary-900">Activity Log</h1>
            <p className="text-xs text-gray-500">All changes across your workspace</p>
          </div>
          {data && <span className="ml-auto text-xs text-gray-400 shrink-0">{data.total} total events</span>}
        </div>

        {/* mobile card list - shown below md */}
        <div className="md:hidden bg-white rounded-xl border border-gray-200 overflow-hidden">
          {emptyState ?? (
            <>
              <div className="divide-y divide-gray-100">
                {data!.logs.map((log) => (
                  <motion.div key={log.uuid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <ActionBadge action={log.action} />
                      <span className="text-xs text-gray-400 whitespace-nowrap">{format(new Date(log.performedAt), "MMM d, HH:mm")}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{log.issue.title}</p>
                    <p className="text-xs text-gray-500 font-mono">{buildDescription(log)}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <UserAvatar user={log.performedBy} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{log.performedBy.name}</p>
                        <p className="text-xs text-gray-400 truncate">{log.performedBy.email}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {pagination}
            </>
          )}
        </div>

        {/* desktop table - shown from md up */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
          {emptyState ?? (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-28">Action</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Issue</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">Description</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-52">Performed By</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-40">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data!.logs.map((log) => (
                    <motion.tr key={log.uuid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="px-4 py-3 max-w-50">
                        <span className="font-medium text-gray-900 line-clamp-1">{log.issue.title}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-gray-600 font-mono text-xs">{buildDescription(log)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={log.performedBy} size="sm" />
                          <div className="min-w-0">
                            <p className="text-gray-900 font-medium truncate">{log.performedBy.name}</p>
                            <p className="text-gray-400 text-xs truncate hidden lg:block">{log.performedBy.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{format(new Date(log.performedAt), "MMM d, yyyy HH:mm")}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {pagination}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ActivityPage;
