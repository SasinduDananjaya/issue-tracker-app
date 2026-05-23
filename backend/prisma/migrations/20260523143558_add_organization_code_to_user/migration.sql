/*
  Warnings:

  - Added the required column `organizationCode` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "organizationCode" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "User_organizationCode_idx" ON "User"("organizationCode");
