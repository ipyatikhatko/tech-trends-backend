/*
  Warnings:

  - A unique constraint covering the columns `[job_id]` on the table `jobs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `job_id` to the `jobs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "job_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "jobs_job_id_key" ON "jobs"("job_id");
