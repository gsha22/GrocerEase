-- AlterTable
ALTER TABLE "shoppers" ADD COLUMN "password_hash" TEXT;

UPDATE "shoppers"
SET "password_hash" = '$2b$10$CwTycUXWue0Thq9StjUM0u1lv/4XmMKL8gwniPoRzozifdDxblDmq'
WHERE "password_hash" IS NULL;

ALTER TABLE "shoppers" ALTER COLUMN "password_hash" SET NOT NULL;
