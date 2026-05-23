import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFilterStore } from "@/store/filterStore";
import StatusCountCards from "@/components/issues/StatusCountCards";
import IssueFilters from "@/components/issues/IssueFilters";
import KanbanBoard from "@/components/issues/KanbanBoard";
import IssueList from "@/components/issues/IssueList";
import IssueForm from "@/components/issues/IssueForm";
import IssueDetail from "@/components/issues/IssueDetail";
import type { Issue } from "@/types";

const IssuesPage = () => {
  const { filters, viewMode } = useFilterStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editIssue, setEditIssue] = useState<Issue | null>(null);
  const [detailIssue, setDetailIssue] = useState<Issue | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleNewIssue = () => {
    setEditIssue(null);
    setFormOpen(true);
  };

  const handleEdit = (issue: Issue) => {
    setEditIssue(issue);
    setFormOpen(true);
  };

  const handleView = (issue: Issue) => {
    setDetailIssue(issue);
    setDetailOpen(true);
  };

  return (
    <div className="flex flex-col h-full px-6 py-5 gap-5 overflow-hidden">
      {/* status stats */}
      <StatusCountCards />

      {/* filter bar */}
      <IssueFilters onNewIssue={handleNewIssue} />

      {/* kanban board / list */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === "kanban" ? (
            <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
              <KanbanBoard filters={filters} onEdit={handleEdit} onView={handleView} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
              <IssueList filters={filters} onEdit={handleEdit} onView={handleView} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* create / edit sheet */}
      <IssueForm open={formOpen} onOpenChange={setFormOpen} editIssue={editIssue} />

      {/* detail dialog */}
      <IssueDetail issue={detailIssue} open={detailOpen} onOpenChange={setDetailOpen} onEdit={handleEdit} />
    </div>
  );
};

export default IssuesPage;
