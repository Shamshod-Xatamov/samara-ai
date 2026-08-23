-- CreateEnum
CREATE TYPE "dataset_format" AS ENUM ('CSV', 'XLSX');

-- CreateEnum
CREATE TYPE "dataset_status" AS ENUM ('UPLOADED', 'PROFILED', 'MAPPED', 'CLEANED', 'FAILED');

-- CreateEnum
CREATE TYPE "column_type" AS ENUM ('DATE', 'NUMBER', 'TEXT', 'BOOLEAN', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "mapping_source" AS ENUM ('AI', 'USER', 'HEURISTIC');

-- CreateEnum
CREATE TYPE "issue_type" AS ENUM ('MISSING', 'DUPLICATE', 'TYPE_ERROR', 'OUTLIER');

-- CreateEnum
CREATE TYPE "issue_severity" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "cleaning_status" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "datasets" (
    "id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "format" "dataset_format" NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "row_count" INTEGER NOT NULL,
    "column_count" INTEGER NOT NULL,
    "status" "dataset_status" NOT NULL DEFAULT 'UPLOADED',
    "quality_score" INTEGER,
    "cleaned_quality_score" INTEGER,
    "uploaded_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "datasets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dataset_columns" (
    "id" UUID NOT NULL,
    "dataset_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "source_name" TEXT NOT NULL,
    "canonical_key" TEXT,
    "data_type" "column_type" NOT NULL DEFAULT 'UNKNOWN',
    "null_count" INTEGER NOT NULL DEFAULT 0,
    "distinct_count" INTEGER NOT NULL DEFAULT 0,
    "invalid_count" INTEGER NOT NULL DEFAULT 0,
    "min_value" DOUBLE PRECISION,
    "max_value" DOUBLE PRECISION,
    "mean_value" DOUBLE PRECISION,
    "std_dev" DOUBLE PRECISION,
    "q1" DOUBLE PRECISION,
    "q3" DOUBLE PRECISION,
    "sample_values" JSONB NOT NULL,
    "mapping_confidence" INTEGER,
    "mapped_by" "mapping_source",
    "mapping_reason" TEXT,

    CONSTRAINT "dataset_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dataset_rows" (
    "id" UUID NOT NULL,
    "dataset_id" UUID NOT NULL,
    "row_index" INTEGER NOT NULL,
    "raw" JSONB NOT NULL,
    "clean" JSONB,
    "issues" JSONB,
    "is_duplicate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "dataset_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_issues" (
    "id" UUID NOT NULL,
    "dataset_id" UUID NOT NULL,
    "column_name" TEXT,
    "issue_type" "issue_type" NOT NULL,
    "count" INTEGER NOT NULL,
    "affected_pct" DOUBLE PRECISION NOT NULL,
    "severity" "issue_severity" NOT NULL,
    "suggested_fix" TEXT NOT NULL,
    "ai_rationale" TEXT,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cleaning_runs" (
    "id" UUID NOT NULL,
    "dataset_id" UUID NOT NULL,
    "status" "cleaning_status" NOT NULL DEFAULT 'RUNNING',
    "quality_before" INTEGER NOT NULL,
    "quality_after" INTEGER,
    "valid_rows_before" INTEGER NOT NULL,
    "valid_rows_after" INTEGER,
    "stage_log" JSONB,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "cleaning_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "datasets_org_id_created_at_idx" ON "datasets"("org_id", "created_at");

-- CreateIndex
CREATE INDEX "dataset_columns_dataset_id_idx" ON "dataset_columns"("dataset_id");

-- CreateIndex
CREATE UNIQUE INDEX "dataset_columns_dataset_id_position_key" ON "dataset_columns"("dataset_id", "position");

-- CreateIndex
CREATE INDEX "dataset_rows_dataset_id_idx" ON "dataset_rows"("dataset_id");

-- CreateIndex
CREATE UNIQUE INDEX "dataset_rows_dataset_id_row_index_key" ON "dataset_rows"("dataset_id", "row_index");

-- CreateIndex
CREATE INDEX "quality_issues_dataset_id_idx" ON "quality_issues"("dataset_id");

-- CreateIndex
CREATE INDEX "cleaning_runs_dataset_id_idx" ON "cleaning_runs"("dataset_id");

-- AddForeignKey
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset_columns" ADD CONSTRAINT "dataset_columns_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset_rows" ADD CONSTRAINT "dataset_rows_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_issues" ADD CONSTRAINT "quality_issues_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_runs" ADD CONSTRAINT "cleaning_runs_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
