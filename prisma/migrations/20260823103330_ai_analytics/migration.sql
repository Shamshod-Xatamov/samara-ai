-- CreateEnum
CREATE TYPE "anomaly_severity" AS ENUM ('CRITICAL', 'WARNING', 'INFO');

-- CreateEnum
CREATE TYPE "anomaly_status" AS ENUM ('OPEN', 'REVIEWED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "decision_priority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM');

-- CreateEnum
CREATE TYPE "decision_status" AS ENUM ('NEW', 'REVIEWED', 'PLANNED');

-- CreateTable
CREATE TABLE "anomalies" (
    "id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "dataset_id" UUID,
    "metric_key" TEXT NOT NULL,
    "detected_at" TIMESTAMP(3) NOT NULL,
    "severity" "anomaly_severity" NOT NULL,
    "method" TEXT NOT NULL,
    "observed" DOUBLE PRECISION NOT NULL,
    "expected" DOUBLE PRECISION NOT NULL,
    "deviation_pct" DOUBLE PRECISION NOT NULL,
    "z_score" DOUBLE PRECISION,
    "status" "anomaly_status" NOT NULL DEFAULT 'OPEN',
    "trend" JSONB NOT NULL,
    "context" JSONB,
    "ai_explanation" JSONB,
    "fingerprint" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anomalies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decisions" (
    "id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "anomaly_id" UUID,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "priority" "decision_priority" NOT NULL,
    "status" "decision_status" NOT NULL DEFAULT 'NEW',
    "confidence" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "feedback" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "anomalies_fingerprint_key" ON "anomalies"("fingerprint");

-- CreateIndex
CREATE INDEX "anomalies_org_id_detected_at_idx" ON "anomalies"("org_id", "detected_at");

-- CreateIndex
CREATE INDEX "anomalies_status_idx" ON "anomalies"("status");

-- CreateIndex
CREATE INDEX "decisions_org_id_created_at_idx" ON "decisions"("org_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "decisions_org_id_code_key" ON "decisions"("org_id", "code");

-- AddForeignKey
ALTER TABLE "anomalies" ADD CONSTRAINT "anomalies_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_anomaly_id_fkey" FOREIGN KEY ("anomaly_id") REFERENCES "anomalies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
