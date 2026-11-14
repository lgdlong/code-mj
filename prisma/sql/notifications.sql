-- Notifications + likes-viewer schema additions.
-- Run once per existing database BEFORE deploy:
--
--   bun --env-file=.env x prisma db execute --file prisma/sql/notifications.sql
--
-- Applied by hand because `prisma db push` also wants to drop the legacy post.imageUrl /
-- post.imagePublicId columns (superseded by the imageUrls / imagePublicIds arrays). That drop
-- is a separate data-loss decision and must not ride along with this feature.
-- Names match Prisma's convention so a later `db push` finds them already in place.

ALTER TABLE "user_setting"
  ADD COLUMN IF NOT EXISTS "notificationsSeenAt" timestamp(3) NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS "like_postId_createdAt_idx"
  ON "like" ("postId", "createdAt");

CREATE INDEX IF NOT EXISTS "follow_followingId_createdAt_idx"
  ON "follow" ("followingId", "createdAt");
