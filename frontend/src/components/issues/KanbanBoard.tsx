import { COLUMN_ORDER } from "@/lib/constants";
import KanbanColumn from "./KanbanColumn";
import type { Issue, IssueFilters } from "@/types/issueTypes";

interface KanbanBoardProps {
  filters: IssueFilters;
  onEdit: (issue: Issue) => void;
  onView: (issue: Issue) => void;
}

//kanban board view of issues with columns
const KanbanBoard = ({ filters, onEdit, onView }: KanbanBoardProps) => (
  <div className="flex gap-4 overflow-x-auto pb-4 h-full">
    {COLUMN_ORDER.map((status) => (
      <KanbanColumn key={status} status={status} filters={filters} onEdit={onEdit} onView={onView} />
    ))}
  </div>
);

export default KanbanBoard;
