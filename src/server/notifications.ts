import { Prisma } from "@prisma/client";
import { NOTIFICATIONS_LIMIT } from "@/lib/constants";
import { prisma } from "@/server/prisma";
import type { ActivityDTO } from "@/types/domain";

const PREVIEW_LENGTH = 80;

const ACTOR_SELECT = {
  id: true,
  username: true,
  name: true,
  image: true,
} satisfies Prisma.UserSelect;

/**
 * Notifications are derived from Like/Comment/Follow rows, so the only stored state is
 * "seen up to when". UserSetting rows are created lazily by PATCH /api/users/me/settings,
 * so a missing row must be persisted with the current time: an in-memory fallback would
 * re-evaluate to "now" on every poll and the unread badge would never fire.
 */
export async function getSeenAt(userId: string): Promise<Date> {
  const setting = await prisma.userSetting.findUnique({
    where: { userId },
    select: { notificationsSeenAt: true },
  });
  if (setting) return setting.notificationsSeenAt;

  try {
    const created = await prisma.userSetting.create({
      data: { userId },
      select: { notificationsSeenAt: true },
    });
    return created.notificationsSeenAt;
  } catch (err) {
    // P2002: a concurrent poll created the row first; reuse it instead of failing.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const existing = await prisma.userSetting.findUnique({
        where: { userId },
        select: { notificationsSeenAt: true },
      });
      if (existing) return existing.notificationsSeenAt;
    }
    throw err;
  }
}

const commentWhere = (viewerId: string) =>
  ({
    authorId: { not: viewerId },
    author: { banned: false },
    OR: [{ post: { authorId: viewerId } }, { parent: { authorId: viewerId } }],
  }) satisfies Prisma.CommentWhereInput;

const likeWhere = (viewerId: string) =>
  ({
    post: { authorId: viewerId },
    userId: { not: viewerId },
    user: { banned: false },
  }) satisfies Prisma.LikeWhereInput;

const followWhere = (viewerId: string) =>
  ({
    followingId: viewerId,
    follower: { banned: false },
  }) satisfies Prisma.FollowWhereInput;

export async function countUnread(viewerId: string): Promise<number> {
  const seenAt = await getSeenAt(viewerId);
  const [likes, comments, follows] = await Promise.all([
    prisma.like.count({ where: { ...likeWhere(viewerId), createdAt: { gt: seenAt } } }),
    // One query for both "on my post" and "reply to me", so a comment can never count twice.
    prisma.comment.count({ where: { ...commentWhere(viewerId), createdAt: { gt: seenAt } } }),
    prisma.follow.count({ where: { ...followWhere(viewerId), createdAt: { gt: seenAt } } }),
  ]);
  return likes + comments + follows;
}

/**
 * Merged activity feed. Each source returns its own newest NOTIFICATIONS_LIMIT rows, so the
 * newest rows of the union are guaranteed to be inside this slice — no cursor needed.
 */
export async function loadActivity(viewerId: string): Promise<ActivityDTO[]> {
  const seenAt = await getSeenAt(viewerId);
  const [likes, comments, follows] = await Promise.all([
    prisma.like.findMany({
      where: likeWhere(viewerId),
      orderBy: { createdAt: "desc" },
      take: NOTIFICATIONS_LIMIT,
      select: {
        createdAt: true,
        user: { select: ACTOR_SELECT },
        post: { select: { id: true, content: true, imageUrls: true } },
      },
    }),
    prisma.comment.findMany({
      where: commentWhere(viewerId),
      orderBy: { createdAt: "desc" },
      take: NOTIFICATIONS_LIMIT,
      select: {
        id: true,
        createdAt: true,
        content: true,
        imageUrls: true,
        author: { select: ACTOR_SELECT },
        post: { select: { id: true, authorId: true } },
      },
    }),
    prisma.follow.findMany({
      where: followWhere(viewerId),
      orderBy: { createdAt: "desc" },
      take: NOTIFICATIONS_LIMIT,
      select: {
        createdAt: true,
        follower: { select: ACTOR_SELECT },
      },
    }),
  ]);

  const isRead = (date: Date) => date <= seenAt;
  const items: ActivityDTO[] = [
    ...likes.map((like) => ({
      id: `l:${like.user.id}:${like.post.id}`,
      kind: "like" as const,
      createdAt: like.createdAt.toISOString(),
      read: isRead(like.createdAt),
      actor: like.user,
      postId: like.post.id,
      preview: like.post.content.trim().slice(0, PREVIEW_LENGTH),
      hasImage: like.post.imageUrls.length > 0,
    })),
    ...comments.map((comment) => ({
      id: `c:${comment.id}`,
      // A comment on my own post wins over "reply", even when it also answers my comment.
      kind: comment.post.authorId === viewerId ? ("comment" as const) : ("reply" as const),
      createdAt: comment.createdAt.toISOString(),
      read: isRead(comment.createdAt),
      actor: comment.author,
      postId: comment.post.id,
      preview: comment.content.trim().slice(0, PREVIEW_LENGTH),
      hasImage: comment.imageUrls.length > 0,
    })),
    ...follows.map((follow) => ({
      id: `f:${follow.follower.id}`,
      kind: "follow" as const,
      createdAt: follow.createdAt.toISOString(),
      read: isRead(follow.createdAt),
      actor: follow.follower,
    })),
  ];

  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  return items.slice(0, NOTIFICATIONS_LIMIT);
}
