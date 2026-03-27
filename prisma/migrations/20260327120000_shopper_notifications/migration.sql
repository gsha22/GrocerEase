-- CreateEnum
CREATE TYPE "ShopperNotificationKind" AS ENUM ('store_fresh_update', 'store_new_deal');

-- CreateTable
CREATE TABLE "shopper_notifications" (
    "id" TEXT NOT NULL,
    "shopper_id" TEXT NOT NULL,
    "kind" "ShopperNotificationKind" NOT NULL,
    "source_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shopper_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shopper_notifications_shopper_id_kind_source_id_key" ON "shopper_notifications"("shopper_id", "kind", "source_id");

-- CreateIndex
CREATE INDEX "shopper_notifications_shopper_id_created_at_idx" ON "shopper_notifications"("shopper_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "shopper_notifications" ADD CONSTRAINT "shopper_notifications_shopper_id_fkey" FOREIGN KEY ("shopper_id") REFERENCES "shoppers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopper_notifications" ADD CONSTRAINT "shopper_notifications_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shopper_notifications" ENABLE ROW LEVEL SECURITY;
