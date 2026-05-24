import { z } from "zod";
import { IssueStatus, IssuePriority, IssueSeverity } from "../constants/enums.js";

//get allowed enum values from constants to use in zod schemas
const statusValues = Object.values(IssueStatus);
const priorityValues = Object.values(IssuePriority);
const severityValues = Object.values(IssueSeverity);

//ISO datetime string
const dateField = z.iso.datetime({ local: true }).pipe(z.coerce.date());

const futureDateField = dateField.refine(
  (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  },
  { message: "Due date cannot be in the past" }
);

//issue DTOs for validating incoming data from issue controller
export const CreateIssueDTO = z.object({
  title: z.string().min(1, "Title is required").max(50, "Title must be at most 50 characters"),
  description: z.string().max(255, "Description must be at most 255 characters").optional(),
  status: z.enum(statusValues).optional(),
  priority: z.enum(priorityValues).optional(),
  severity: z.enum(severityValues).optional(),
  dueDate: futureDateField.optional(),
  assigneeUuid: z.string().uuid("Invalid assignee").optional(),
});

export const UpdateIssueDTO = z
  .object({
    title: z.string().min(1, "Title is required").max(50, "Title must be at most 50 characters").optional(),
    description: z.string().max(255, "Description must be at most 255 characters").nullish(),
    status: z.enum(statusValues).optional(),
    priority: z.enum(priorityValues).optional(),
    severity: z.enum(severityValues).optional(),
    dueDate: futureDateField.nullish(),
    assigneeUuid: z.string().uuid("Invalid assignee").nullish(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field is required",
  });

export const ListIssuesDTO = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: z.enum(statusValues).optional(),
  priority: z.enum(priorityValues).optional(),
  severity: z.enum(severityValues).optional(),
  createdBy: z.string().uuid().optional(),
  assignee: z.string().uuid().optional(),
  updatedBy: z.string().uuid().optional(),
  dueDateFrom: dateField.optional(),
  dueDateTo: dateField.optional(),
});
