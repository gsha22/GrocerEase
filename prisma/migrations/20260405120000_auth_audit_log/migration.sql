-- CreateTable
CREATE TABLE "auth_audit_logs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "email_hash" TEXT,
    "owner_id" TEXT,
    "ip_address" TEXT,

    CONSTRAINT "auth_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_audit_logs_created_at_idx" ON "auth_audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "auth_audit_logs_owner_id_created_at_idx" ON "auth_audit_logs"("owner_id", "created_at");

-- CreateIndex
CREATE INDEX "auth_audit_logs_email_hash_created_at_idx" ON "auth_audit_logs"("email_hash", "created_at");
