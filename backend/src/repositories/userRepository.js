import prisma from "../config/dbConfig.js";

//repository to handle user related database operations
const userRepository = {
  async createUser(data) {
    return prisma.user.create({ data });
  },

  async findByEmail(email) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  },

  async softDelete(id) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  //find all users in the same organization for dropdowns and filters
  async findOrgMembers(organizationCode) {
    return prisma.user.findMany({
      where: { organizationCode, deletedAt: null },
      select: { uuid: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  },
};

export default userRepository;
