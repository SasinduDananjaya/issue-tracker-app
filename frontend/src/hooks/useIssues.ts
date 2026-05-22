import { useInfiniteQuery } from "@tanstack/react-query";
import { listIssues } from "@/api/issueApi";
import type { IssueFilters, IssueStatus } from "@/types";

//hook to fetch issues for kanban board with infinite scrolling
const useIssues = (status: IssueStatus, filters: IssueFilters) =>
  useInfiniteQuery({
    queryKey: ["issues", "kanban", status, filters],
    queryFn: ({ pageParam }) => listIssues({ ...filters, status }, pageParam as number, 20),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });

export default useIssues;
