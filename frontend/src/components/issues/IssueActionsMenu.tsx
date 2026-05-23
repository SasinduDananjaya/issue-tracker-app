import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { deleteIssue, updateIssue } from "@/api/issueApi";
import type { Issue } from "@/types/issueTypes";

interface IssueActionsMenuProps {
  issue: Issue;
  onEdit: (issue: Issue) => void;
}

//action menu for each issue in the list to edit, change status or delete the issue
const IssueActionsMenu = ({ issue, onEdit }: IssueActionsMenuProps) => {
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["issues"] });

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteIssue(issue.uuid);
      invalidate();
      toast.success("Issue deleted");
      setDeleteOpen(false);
    } catch {
      toast.error("Failed to delete issue");
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (status: "RESOLVED" | "CLOSED") => {
    setLoading(true);
    try {
      await updateIssue(issue.uuid, { status });
      invalidate();
      toast.success(`Issue marked as ${status === "RESOLVED" ? "Resolved" : "Closed"}`);
      setResolveOpen(false);
      setCloseOpen(false);
    } catch {
      toast.error("Failed to update issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon-xs" className="text-gray-400 hover:text-gray-700">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-primary text-white" arrowClassName="bg-primary fill-primary">
            Actions
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit(issue);
            }}
            className="hover:bg-primary-50"
          >
            <Pencil className="w-3.5 h-3.5 mr-2 text-primary" /> Edit
          </DropdownMenuItem>
          {issue.status !== "RESOLVED" && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setResolveOpen(true);
              }}
              className="hover:bg-primary-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-green-600" /> Mark Resolved
            </DropdownMenuItem>
          )}
          {issue.status !== "CLOSED" && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setCloseOpen(true);
              }}
              className="hover:bg-primary-50"
            >
              <XCircle className="w-3.5 h-3.5 mr-2 text-red-500" /> Mark Closed
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 hover:bg-primary-50"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete issue"
        description={`Are you sure you want to delete "${issue.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
      <ConfirmDialog
        open={resolveOpen}
        onOpenChange={setResolveOpen}
        title="Mark as Resolved"
        description={`Mark "${issue.title}" as resolved?`}
        confirmLabel="Mark Resolved"
        variant="default"
        loading={loading}
        onConfirm={() => handleStatus("RESOLVED")}
      />
      <ConfirmDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        title="Close issue"
        description={`Are you sure you want to close "${issue.title}"?`}
        confirmLabel="Close Issue"
        variant="warning"
        loading={loading}
        onConfirm={() => handleStatus("CLOSED")}
      />
    </>
  );
};

export default IssueActionsMenu;
