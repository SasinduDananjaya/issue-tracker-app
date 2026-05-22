import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { createIssue, updateIssue } from "@/api/issueApi";
import { ALL_STATUSES, ALL_PRIORITIES, ALL_SEVERITIES, STATUS_LABELS, PRIORITY_LABELS, SEVERITY_LABELS } from "@/lib/constants";
import type { CreateIssuePayload } from "@/types";
import type { Issue } from "@/types/issueTypes";

interface IssueFormValues {
  title: string;
  description: string;
  status: string;
  priority: string;
  severity: string;
  dueDate?: Date;
}

interface IssueFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editIssue?: Issue | null;
}

//form for creating and editing an issue in a card
const IssueForm = ({ open, onOpenChange, editIssue }: IssueFormProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!editIssue;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IssueFormValues>({
    defaultValues: {
      title: "",
      description: "",
      status: "OPEN",
      priority: "MEDIUM",
      severity: "MEDIUM",
      dueDate: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        editIssue
          ? {
              title: editIssue.title,
              description: editIssue.description ?? "",
              status: editIssue.status,
              priority: editIssue.priority,
              severity: editIssue.severity,
              dueDate: editIssue.dueDate ? new Date(editIssue.dueDate) : undefined,
            }
          : { title: "", description: "", status: "OPEN", priority: "MEDIUM", severity: "MEDIUM", dueDate: undefined },
      );
    }
  }, [open, editIssue, reset]);

  const onSubmit = async (values: IssueFormValues) => {
    const payload: CreateIssuePayload = {
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      status: values.status as CreateIssuePayload["status"],
      priority: values.priority as CreateIssuePayload["priority"],
      severity: values.severity as CreateIssuePayload["severity"],
      dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
    };
    try {
      if (isEdit && editIssue) {
        await updateIssue(editIssue.uuid, payload);
        toast.success("Issue updated");
      } else {
        await createIssue(payload);
        toast.success("Issue created");
      }
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      onOpenChange(false);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-120 flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>{isEdit ? "Edit Issue" : "New Issue"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex-1 px-6 py-5 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Short, descriptive title"
                {...register("title", {
                  required: "Title is required",
                  maxLength: { value: 50, message: "Max 50 characters" },
                })}
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail…"
                rows={3}
                {...register("description", { maxLength: { value: 255, message: "Max 255 characters" } })}
                aria-invalid={!!errors.description}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {PRIORITY_LABELS[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Severity + Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Severity</Label>
                <Controller
                  name="severity"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_SEVERITIES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {SEVERITY_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal text-sm">
                          <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                          {field.value ? format(field.value, "MMM d, yyyy") : <span className="text-gray-400">Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                        {field.value && (
                          <div className="px-3 pb-3">
                            <Button variant="ghost" size="sm" className="w-full text-gray-500" onClick={() => field.onChange(undefined)}>
                              Clear date
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isEdit ? "Save changes" : "Create issue"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default IssueForm;
