-- Replace legacy placeholder hash with an explicit locked marker.
-- Any row left in this state should complete password-reset before login.
UPDATE "shoppers"
SET "password_hash" = '__LOCKED__'
WHERE "password_hash" = '$2a$12$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa';
