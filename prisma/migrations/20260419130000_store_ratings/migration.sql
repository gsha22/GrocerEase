-- CreateTable
CREATE TABLE "store_ratings" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "shopper_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "store_ratings_store_id_shopper_id_key" ON "store_ratings"("store_id", "shopper_id");

-- CreateIndex
CREATE INDEX "store_ratings_store_id_created_at_idx" ON "store_ratings"("store_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "store_ratings" ADD CONSTRAINT "store_ratings_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_ratings" ADD CONSTRAINT "store_ratings_shopper_id_fkey" FOREIGN KEY ("shopper_id") REFERENCES "shoppers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
