-- AlterTable
ALTER TABLE "deals" ADD COLUMN     "price" DECIMAL(10,2),
ADD COLUMN     "expiry_notified_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "owner_notifications" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "owner_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "owner_notifications_owner_id_read_at_idx" ON "owner_notifications"("owner_id", "read_at");

-- AddForeignKey
ALTER TABLE "owner_notifications" ADD CONSTRAINT "owner_notifications_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "store_owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_notifications" ADD CONSTRAINT "owner_notifications_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
