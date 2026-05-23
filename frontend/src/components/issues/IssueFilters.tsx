import { LayoutGrid, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/store/filterStore";
import FilterPanel from "./FilterPanel";

interface IssueFiltersProps {
  onNewIssue: () => void;
}

const IssueFilters = ({ onNewIssue }: IssueFiltersProps) => {
  const { viewMode, setViewMode } = useFilterStore();

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      {/* kanban and list tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode("kanban")}
          className={`gap-1.5 h-8 w-40  px-3 text-xs font-medium ${
            viewMode === "kanban" ? "bg-primary-50 text-primary-900 shadow-sm hover:bg-primary-100" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Kanban
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode("list")}
          className={`gap-1.5 h-8 w-40 px-3 text-xs font-medium ${viewMode === "list" ? "bg-primary-50 text-primary-900 shadow-sm hover:bg-primary-100" : "text-gray-500 hover:text-gray-700"}`}
        >
          <List className="w-3.5 h-3.5" />
          List
        </Button>
      </div>

      {/* new issue btn */}
      <div className="flex items-center gap-2">
        <FilterPanel />
        <Button size="sm" className="bg-primary hover:bg-primary-700 text-white gap-1.5" onClick={onNewIssue}>
          <Plus className="w-4 h-4" />
          New Issue
        </Button>
      </div>
    </div>
  );
};

export default IssueFilters;
