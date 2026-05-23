import prisma from "../config/dbConfig.js";

const USER_SELECT = { select: { uuid: true, name: true, email: true } };

//repository to handle issue related database operations
const issueRepository = {
  async create(data) {
    return prisma.issue.create({
      data,
      include: { createdBy: USER_SELECT, assignee: USER_SELECT },
    });
  },

  async findByUuid(uuid, organizationCode) {
    return prisma.issue.findFirst({
      where: { uuid, deletedAt: null, createdBy: { is: { organizationCode } } },
      include: { createdBy: USER_SELECT, assignee: USER_SELECT },
    });
  },

  async findById(id, organizationCode) {
    return prisma.issue.findFirst({
      where: { id, deletedAt: null, createdBy: { is: { organizationCode } } },
      include: { createdBy: USER_SELECT, assignee: USER_SELECT },
    });
  },

  async list({ page = 1, limit = 20, search, status, priority, severity, createdBy, assignee, dueDateFrom, dueDateTo } = {}, organizationCode) {
    const where = {
      deletedAt: null,
      createdBy: { is: { organizationCode } },
    };

    if (search) where.title = { contains: search, mode: "insensitive" };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (severity) where.severity = severity;

    //uuid-based user filters to ensure users can only filter by users within their organization
    if (createdBy) where.createdBy = { is: { organizationCode, uuid: createdBy } };
    if (assignee) where.assignee = { is: { uuid: assignee } };

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
    }

    const skip = (page - 1) * limit;

    const [issues, total] = await prisma.$transaction([
      prisma.issue.findMany({
        where,
        include: { createdBy: USER_SELECT, assignee: USER_SELECT },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.issue.count({ where }),
    ]);

    return { issues, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async update(id, data) {
    return prisma.issue.update({
      where: { id },
      data,
      include: { createdBy: USER_SELECT, assignee: USER_SELECT },
    });
  },

  async softDelete(id) {
    return prisma.issue.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: { createdBy: USER_SELECT, assignee: USER_SELECT },
    });
  },

  async countByStatus(organizationCode) {
    return prisma.issue.groupBy({
      by: ["status"],
      where: { deletedAt: null, createdBy: { is: { organizationCode } } },
      _count: { _all: true },
    });
  },
};

export default issueRepository;
