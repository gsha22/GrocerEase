-- CreateTable
CREATE TABLE "store_profile_views" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_profile_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_item_searches" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_item_searches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "store_profile_views_store_id_created_at_idx" ON "store_profile_views"("store_id", "created_at");

-- CreateIndex
CREATE INDEX "store_item_searches_store_id_created_at_idx" ON "store_item_searches"("store_id", "created_at");

-- AddForeignKey
ALTER TABLE "store_profile_views" ADD CONSTRAINT "store_profile_views_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_item_searches" ADD CONSTRAINT "store_item_searches_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
