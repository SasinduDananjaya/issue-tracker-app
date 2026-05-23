import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

//generic pagination component for activity log and issue list pages
interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
  itemLabel?: string;
  isLoading?: boolean;
  onChange: (page: number) => void;
}

const getPageWindow = (page: number, totalPages: number): number[] => {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
};

const Pagination = ({ page, totalPages, total, pageSize, itemLabel = "items", isLoading, onChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const rangeText =
    total !== undefined && pageSize !== undefined
      ? `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} of ${total} ${itemLabel}`
      : `Page ${page} of ${totalPages}`;

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <p className="text-sm text-gray-500">{rangeText}</p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" onClick={() => onChange(page - 1)} disabled={page === 1 || isLoading} aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {getPageWindow(page, totalPages).map((n) => (
          <Button
            key={n}
            variant={n === page ? "default" : "outline"}
            size="icon-sm"
            className={n === page ? "bg-primary hover:bg-primary-700 text-white" : ""}
            onClick={() => onChange(n)}
            disabled={isLoading}
          >
            {n}
          </Button>
        ))}

        <Button variant="outline" size="icon-sm" onClick={() => onChange(page + 1)} disabled={page === totalPages || isLoading} aria-label="Next page">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
