import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Loader2, UserIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { createIssue, updateIssue } from "@/api/issueApi";
import { getOrgMembers } from "@/api/userApi";
import { useAuthStore } from "@/store/authStore";
import { ALL_STATUSES, ALL_PRIORITIES, ALL_SEVERITIES, STATUS_LABELS, PRIORITY_LABELS, SEVERITY_LABELS } from "@/lib/constants";
import type { CreateIssuePayload, IssueStats } from "@/types";
import type { Issue } from "@/types/issueTypes";

const UNASSIGNED = "__none__";

interface IssueFormValues {
  title: string;
  description: string;
  status: string;
  priority: string;
  severity: string;
  dueDate?: Date;
  assigneeUuid?: string;
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
  const currentUser = useAuthStore((s) => s.user);
  const isOrgOwner = currentUser?.isOrgOwner ?? false;

  const { data: orgMembers = [] } = useQuery({
    queryKey: ["orgMembers"],
    queryFn: getOrgMembers,
    enabled: isOrgOwner,
    staleTime: 5 * 60 * 1000,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<IssueFormValues>({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      status: "OPEN",
      priority: "MEDIUM",
      severity: "MEDIUM",
      dueDate: undefined,
      assigneeUuid: UNASSIGNED,
    },
  });

  const titleLen = watch("title")?.length ?? 0;
  const descLen = watch("description")?.length ?? 0;

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
              assigneeUuid: editIssue.assignee?.uuid ?? UNASSIGNED,
            }
          : { title: "", description: "", status: "OPEN", priority: "MEDIUM", severity: "MEDIUM", dueDate: undefined, assigneeUuid: UNASSIGNED },
      );
    }
  }, [open, editIssue, reset]);

  const onSubmit = async (values: IssueFormValues) => {
    const assigneeValue = isOrgOwner ? values.assigneeUuid : undefined;

    const createPayload: CreateIssuePayload = {
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      status: values.status as CreateIssuePayload["status"],
      priority: values.priority as CreateIssuePayload["priority"],
      severity: values.severity as CreateIssuePayload["severity"],
      dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      ...(assigneeValue && assigneeValue !== UNASSIGNED && { assigneeUuid: assigneeValue }),
    };

    try {
      if (isEdit && editIssue) {
        await updateIssue(editIssue.uuid, {
          ...createPayload,
          assigneeUuid: assigneeValue === UNASSIGNED ? null : (assigneeValue ?? undefined),
        });
        toast.success("Issue updated");
      } else {
        const created = await createIssue(createPayload);
        toast.success("Issue created");
        const statsKey = ["issues", "stats"];
        const prevStats = queryClient.getQueryData<IssueStats>(statsKey);
        if (prevStats) {
          queryClient.setQueryData<IssueStats>(statsKey, {
            ...prevStats,
            [created.status]: prevStats[created.status] + 1,
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      onOpenChange(false);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 flex flex-col max-h-[90vh] overflow-hidden" showCloseButton={false}>
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>{isEdit ? "Edit Issue" : "New Issue"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="title"
                  placeholder="Short, descriptive title"
                  className="pr-14"
                  maxLength={50}
                  {...register("title", {
                    required: "Title is required",
                    maxLength: { value: 50, message: "Max 50 characters" },
                  })}
                  aria-invalid={!!errors.title}
                />
                <span
                  className={`pointer-events-none absolute right-2.5 bottom-0.5 text-[10px] tabular-nums ${titleLen > 45 ? "text-red-500" : titleLen > 38 ? "text-amber-500" : "text-muted-foreground"}`}
                >
                  {titleLen}/50
                </span>
              </div>
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <div className="relative">
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail…"
                  rows={3}
                  className="pb-6"
                  maxLength={255}
                  {...register("description", { maxLength: { value: 255, message: "Max 255 characters" } })}
                  aria-invalid={!!errors.description}
                />
                <span
                  className={`pointer-events-none absolute right-2.5 bottom-0.5 text-[10px] tabular-nums ${descLen > 230 ? "text-red-500" : descLen > 200 ? "text-amber-500" : "text-muted-foreground"}`}
                >
                  {descLen}/255
                </span>
              </div>
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            {/* Status and priority */}
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
                        {ALL_STATUSES.filter((s) => isEdit || (s !== "RESOLVED" && s !== "CLOSED")).map((s) => (
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

            {/* Assignee - org owner only */}
            {isOrgOwner && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-gray-400" /> Assignee
                </Label>
                <Controller
                  name="assigneeUuid"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                        {orgMembers.map((m) => (
                          <SelectItem key={m.uuid} value={m.uuid} textValue={m.name}>
                            <div className="flex flex-col overflow-hidden max-w-full">
                              <span className="truncate font-medium">{m.name}</span>
                              <span className="truncate text-xs text-gray-400">{m.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

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
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        />
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

          <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-700 text-white" disabled={isSubmitting || !isValid || (isEdit && !isDirty)}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isEdit ? "Save changes" : "Create issue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IssueForm;
