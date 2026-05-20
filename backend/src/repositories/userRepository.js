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
};

export default userRepository;
