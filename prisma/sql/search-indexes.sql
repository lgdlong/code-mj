-- Search indexes used by /api/search (ILIKE '%term%' on Prisma `contains`).
-- Run once per fresh database BEFORE `prisma db push`: the GIN operator classes
-- declared in prisma/schema.prisma require the pg_trgm extension to exist.
--
--   psql "$DIRECT_URL" -f prisma/sql/search-indexes.sql
--
-- `db push` then finds these indexes already matching the schema (Prisma names them
-- <table>_<column>_idx from @@map, same as below) and leaves them alone.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS post_content_idx ON post USING gin (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS user_username_idx ON "user" USING gin (username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS user_name_idx ON "user" USING gin (name gin_trgm_ops);
