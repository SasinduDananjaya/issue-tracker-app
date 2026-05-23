import prisma from "../config/dbConfig.js";

//repository to handle audit log related database operations
const auditLogRepository = {
  async createOne(data) {
    return prisma.auditLog.create({ data });
  },

  async createMany(dataArray) {
    if (!dataArray.length) return;
    return prisma.auditLog.createMany({ data: dataArray });
  },

  async findByIssueId(issueId) {
    return prisma.auditLog.findMany({
      where: { entity: "Issue", entityId: issueId },
      include: {
        performedBy: { select: { uuid: true, name: true, email: true } },
      },
      orderBy: { performedAt: "desc" },
    });
  },

  async findAll(organizationCode, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const where = { issue: { createdBy: { is: { organizationCode } } } };

    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        include: {
          performedBy: { select: { uuid: true, name: true, email: true } },
          issue: { select: { uuid: true, title: true } },
        },
        orderBy: { performedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
};

export default auditLogRepository;
