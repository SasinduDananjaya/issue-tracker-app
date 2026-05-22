import { useQuery } from "@tanstack/react-query";
import { listIssues } from "@/api/issueApi";
import type { IssueFilters } from "@/types";

//hook to fetch paginated issues with filters
const useIssueList = (filters: IssueFilters, page: number) =>
  useQuery({
    queryKey: ["issues", "list", page, filters],
    queryFn: () => listIssues(filters, page, 20),
    placeholderData: (prev) => prev,
  });

export default useIssueList;
