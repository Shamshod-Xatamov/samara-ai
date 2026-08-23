-- CreateTable
CREATE TABLE "ai_cache" (
    "id" UUID NOT NULL,
    "org_id" UUID,
    "task" TEXT NOT NULL,
    "cache_key" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "tokens_in" INTEGER,
    "tokens_out" INTEGER,
    "latency_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "ai_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_cache_cache_key_key" ON "ai_cache"("cache_key");

-- CreateIndex
CREATE INDEX "ai_cache_task_idx" ON "ai_cache"("task");

-- CreateIndex
CREATE INDEX "ai_cache_org_id_idx" ON "ai_cache"("org_id");
