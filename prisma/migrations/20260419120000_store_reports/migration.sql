-- CreateEnum
CREATE TYPE "StoreReportType" AS ENUM ('out_of_stock', 'incorrect_hours', 'wrong_price', 'other');

-- CreateTable
CREATE TABLE "store_reports" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "shopper_id" TEXT NOT NULL,
    "type" "StoreReportType" NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "store_reports_store_id_created_at_idx" ON "store_reports"("store_id", "created_at");

-- CreateIndex
CREATE INDEX "store_reports_shopper_id_store_id_created_at_idx" ON "store_reports"("shopper_id", "store_id", "created_at");

-- AddForeignKey
ALTER TABLE "store_reports" ADD CONSTRAINT "store_reports_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_reports" ADD CONSTRAINT "store_reports_shopper_id_fkey" FOREIGN KEY ("shopper_id") REFERENCES "shoppers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
