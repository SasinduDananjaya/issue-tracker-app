import prisma from "../config/dbConfig.js";
import issueRepository from "../repositories/issueRepository.js";
import auditLogRepository from "../repositories/auditLogRepository.js";
import { buildCreateLog, buildUpdateLogs, buildDeleteLog } from "../utils/auditDiff.js";
import { IssueStatus, RESOLVED_STATUSES } from "../constants/enums.js";
import AppError from "../utils/error.js";

//remove internal fields and relations from issue object before sending to FE
const sanitizeIssue = ({ id, createdById, assigneeId, ...rest }) => rest;

//resolve assigneeUuid to internal User.id, scoped to the same organization
const resolveAssigneeId = async (assigneeUuid, organizationCode) => {
  if (assigneeUuid === undefined) return undefined;
  if (assigneeUuid === null) return null;
  const user = await prisma.user.findFirst({ where: { uuid: assigneeUuid, deletedAt: null, organizationCode } });
  if (!user) throw new AppError("Assignee not found", 404);
  return user.id;
};

//service to handle issue logic for CRUD and audit logging
const issueService = {
  async create(body, performedById, organizationCode) {
    const { assigneeUuid, ...rest } = body;
    const assigneeId = await resolveAssigneeId(assigneeUuid, organizationCode);

    const issue = await prisma.$transaction(async (tx) => {
      const created = await tx.issue.create({
        data: { ...rest, createdById: performedById, ...(assigneeId !== undefined && { assigneeId }) },
        include: {
          createdBy: { select: { uuid: true, name: true, email: true } },
          assignee: { select: { uuid: true, name: true, email: true } },
        },
      });
      await tx.auditLog.create({ data: buildCreateLog(created, performedById) });
      return created;
    });

    return sanitizeIssue(issue);
  },

  async list(query, organizationCode) {
    const result = await issueRepository.list(query, organizationCode);
    return { ...result, issues: result.issues.map(sanitizeIssue) };
  },

  async getStats(organizationCode) {
    const rows = await issueRepository.countByStatus(organizationCode);
    const stats = Object.fromEntries(Object.values(IssueStatus).map((s) => [s, 0]));
    for (const row of rows) stats[row.status] = row._count._all;
    return stats;
  },

  async getByUuid(uuid, organizationCode) {
    const issue = await issueRepository.findByUuid(uuid, organizationCode);
    if (!issue) throw new AppError("Issue not found", 404);
    return sanitizeIssue(issue);
  },

  async update(uuid, body, performedById, organizationCode) {
    const existing = await issueRepository.findByUuid(uuid, organizationCode);
    if (!existing) throw new AppError("Issue not found", 404);

    const { assigneeUuid, ...rest } = body;
    const updateData = { ...rest };

    //resolve assignee only when the key was explicitly provided in the payload
    if ("assigneeUuid" in body) {
      const resolvedId = await resolveAssigneeId(assigneeUuid, organizationCode);
      if (resolvedId !== undefined) updateData.assigneeId = resolvedId;
    }

    //auto manage resolvedAt on status transitions
    if (rest.status) {
      if (RESOLVED_STATUSES.has(rest.status) && !existing.resolvedAt) {
        updateData.resolvedAt = new Date();
      } else if (!RESOLVED_STATUSES.has(rest.status) && existing.resolvedAt) {
        updateData.resolvedAt = null;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const newIssue = await tx.issue.update({
        where: { id: existing.id },
        data: updateData,
        include: {
          createdBy: { select: { uuid: true, name: true, email: true } },
          assignee: { select: { uuid: true, name: true, email: true } },
        },
      });
      const logs = buildUpdateLogs(existing, newIssue, performedById);
      if (logs.length) await tx.auditLog.createMany({ data: logs });
      return newIssue;
    });

    return sanitizeIssue(updated);
  },

  async remove(uuid, performedById, organizationCode) {
    const existing = await issueRepository.findByUuid(uuid, organizationCode);
    if (!existing) throw new AppError("Issue not found", 404);

    await prisma.$transaction(async (tx) => {
      await tx.issue.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
      await tx.auditLog.create({ data: buildDeleteLog(existing, performedById) });
    });
  },

  async getAuditLog(uuid, organizationCode) {
    const issue = await issueRepository.findByUuid(uuid, organizationCode);
    if (!issue) throw new AppError("Issue not found", 404);
    const logs = await auditLogRepository.findByIssueId(issue.id);
    return logs.map(({ id, entityId, performedById, ...rest }) => rest);
  },
};

export default issueService;
