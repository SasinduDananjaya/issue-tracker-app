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
};

export default auditLogRepository;
