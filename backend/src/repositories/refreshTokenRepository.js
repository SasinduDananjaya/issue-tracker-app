import prisma from "../config/dbConfig.js";

//repository to handle refresh token related database operations
const refreshTokenRepository = {
  async create({ token, userId, expiresAt }) {
    return prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });
  },

  async findByToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  async deleteByToken(token) {
    return prisma.refreshToken.delete({ where: { token } });
  },
};

export default refreshTokenRepository;
