import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

//function to connect with db
export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
};

export default prisma;
