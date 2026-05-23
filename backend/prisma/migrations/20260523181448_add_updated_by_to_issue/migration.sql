-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "updatedById" INTEGER;

-- CreateIndex
CREATE INDEX "Issue_updatedById_idx" ON "Issue"("updatedById");

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
