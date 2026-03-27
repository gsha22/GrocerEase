-- AlterTable
ALTER TABLE "shoppers" ADD COLUMN "password_hash" TEXT;

-- Backfill existing rows (seed replaces these; invalid placeholder until re-seed)
UPDATE "shoppers" SET "password_hash" = '$2a$12$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa'
WHERE "password_hash" IS NULL;

ALTER TABLE "shoppers" ALTER COLUMN "password_hash" SET NOT NULL;
