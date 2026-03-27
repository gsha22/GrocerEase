-- Enable Row Level Security on all app tables (Supabase-friendly baseline).
-- If `prisma migrate status` reports a checksum mismatch, the SQL here differs
-- from what was applied on your database. Replace this file with the exact
-- migration from whoever ran it, or recover from `_prisma_migrations` / SQL history.

ALTER TABLE "store_owners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "password_reset_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fresh_updates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "owner_notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shoppers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "alerts" ENABLE ROW LEVEL SECURITY;
