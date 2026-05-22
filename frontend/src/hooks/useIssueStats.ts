import { useQuery } from "@tanstack/react-query";
import { getIssueStats } from "@/api/issueApi";

//hook to fetch issue stats for dashboard
const useIssueStats = () =>
  useQuery({
    queryKey: ["issues", "stats"],
    queryFn: getIssueStats,
    refetchInterval: 30_000,
  });

export default useIssueStats;
