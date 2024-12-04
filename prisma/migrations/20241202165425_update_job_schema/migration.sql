-- CreateTable
CREATE TABLE "technologies" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "djinni_keyword" VARCHAR(100) NOT NULL,

    CONSTRAINT "technologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "salary" TEXT,
    "company" TEXT,
    "company_logo" TEXT,
    "work_format" TEXT,
    "location" TEXT,
    "description" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "applications" INTEGER NOT NULL DEFAULT 0,
    "posted_at" TIMESTAMP(3),
    "experience_years" DOUBLE PRECISION,
    "english_level" TEXT,
    "technology_id" INTEGER,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "technologies_name_key" ON "technologies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "technologies_djinni_keyword_key" ON "technologies"("djinni_keyword");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
