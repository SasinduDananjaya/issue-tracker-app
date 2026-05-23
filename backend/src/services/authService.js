import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../config/dbConfig.js";
import userRepository from "../repositories/userRepository.js";
import refreshTokenRepository from "../repositories/refreshTokenRepository.js";
import AppError from "../utils/error.js";

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || "7", 10);
const BCRYPT_ROUNDS = 12;

//sanitize user object to exclude sensitive fields like password
const sanitizeUser = (user) => ({
  uuid: user.uuid,
  name: user.name,
  email: user.email,
  organizationCode: user.organizationCode,
  isOrgOwner: user.isOrgOwner,
  createdAt: user.createdAt,
});

//generate JWT access token
const signAccessToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

//generate secure random string for refresh token
const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

//store refresh token in database with expiry
const storeRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  return refreshTokenRepository.create({ token, userId, expiresAt });
};

//issue new access and refresh token pair for a user
const issueTokens = async (user) => {
  const accessToken = signAccessToken({
    id: user.id,
    uuid: user.uuid,
    email: user.email,
    name: user.name,
    organizationCode: user.organizationCode,
    isOrgOwner: user.isOrgOwner,
  });
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(user.id, refreshToken);
  return { accessToken, refreshToken };
};

//service to handle authentication logic for registration, login, token refresh and logout
const authService = {
  async register({ name, email, password, companyCode }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new AppError("Email already registered", 409);

    let organizationCode;
    let isOrgOwner = false;
    if (companyCode) {
      const orgMember = await prisma.user.findFirst({ where: { organizationCode: companyCode } });
      if (!orgMember) throw new AppError("Invalid code", 404);
      organizationCode = companyCode;
    } else {
      organizationCode = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
      isOrgOwner = true;
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await userRepository.createUser({ name, email, password: hashedPassword, organizationCode, isOrgOwner });

    const tokens = await issueTokens(user);
    return { ...tokens, user: sanitizeUser(user) };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError("Invalid email or password", 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError("Invalid email or password", 401);

    const tokens = await issueTokens(user);
    return { ...tokens, user: sanitizeUser(user) };
  },

  async refresh({ refreshToken }) {
    const record = await refreshTokenRepository.findByToken(refreshToken);
    if (!record) throw new AppError("Invalid refresh token", 401);

    if (record.expiresAt < new Date()) {
      await refreshTokenRepository.deleteByToken(refreshToken);
      throw new AppError("Refresh token expired", 401);
    }

    if (record.user.deletedAt) throw new AppError("Account no longer exists", 401);

    //atomically delete old token and issue new pair to prevent token loss on failure
    return prisma.$transaction(async () => {
      await refreshTokenRepository.deleteByToken(refreshToken);
      return issueTokens(record.user);
    });
  },

  async logout({ refreshToken }) {
    await refreshTokenRepository.deleteByToken(refreshToken).catch((err) => console.error("Logout token deletion failed:", err));
  },
};

export default authService;
