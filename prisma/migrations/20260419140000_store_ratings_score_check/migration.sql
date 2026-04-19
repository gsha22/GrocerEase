-- Enforce the 1–5 star range at the database layer so a buggy caller
-- (or direct SQL) can't insert an out-of-range score.
ALTER TABLE "store_ratings"
  ADD CONSTRAINT "store_ratings_score_range" CHECK ("score" BETWEEN 1 AND 5);
