import { MAX_USERS } from "@/lib/constants";
import { handleApiError, jsonOk } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireAdminUser } from "@/server/session";
import type { AdminDailyStatDTO, AdminStatsDTO } from "@/types/domain";

const DAYS_WINDOW = 5;
const ACTIVE_WINDOW_DAYS = 7;

export async function GET() {
  try {
    await requireAdminUser();

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - ACTIVE_WINDOW_DAYS);

    const [
      totalUsers,
      bannedUsers,
      totalPosts,
      postsWithImage,
      totalComments,
      totalLikes,
      pendingReports,
      activePostAuthors,
      latestPostsRaw,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { banned: true } }),
      prisma.post.count(),
      prisma.post.count({ where: { imageUrls: { isEmpty: false } } }),
      prisma.comment.count(),
      prisma.like.count(),
      prisma.report.count({ where: { status: "pending" } }),
      prisma.post.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { authorId: true },
        distinct: ["authorId"],
      }),
      prisma.post.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { username: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
    ]);

    // 5-day buckets: one findMany per table selecting only createdAt, folded into
    // day buckets in JS. (groupby-by-timestamp buys nothing over this; raw SQL
    // date_trunc not worth it at this scale.) Order matches the old shape:
    // newest day first.
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - (DAYS_WINDOW - 1));

    const bucketLabel = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

    const [postDays, commentDays, likeDays, userDays] = await Promise.all([
      prisma.post.findMany({ where: { createdAt: { gte: dayStart } }, select: { createdAt: true } }),
      prisma.comment.findMany({ where: { createdAt: { gte: dayStart } }, select: { createdAt: true } }),
      prisma.like.findMany({ where: { createdAt: { gte: dayStart } }, select: { createdAt: true } }),
      prisma.user.findMany({ where: { createdAt: { gte: dayStart } }, select: { createdAt: true } }),
    ]);

    const tables = {
      posts: new Map<string, number>(),
      comments: new Map<string, number>(),
      likes: new Map<string, number>(),
      users: new Map<string, number>(),
    };
    const addTo = (table: Map<string, number>, createdAt: Date) => {
      const day = new Date(createdAt);
      day.setHours(0, 0, 0, 0);
      const label = bucketLabel(day);
      table.set(label, (table.get(label) ?? 0) + 1);
    };
    for (const row of postDays) addTo(tables.posts, row.createdAt);
    for (const row of commentDays) addTo(tables.comments, row.createdAt);
    for (const row of likeDays) addTo(tables.likes, row.createdAt);
    for (const row of userDays) addTo(tables.users, row.createdAt);

    const dailyStats: AdminDailyStatDTO[] = Array.from({ length: DAYS_WINDOW }, (_, i) => {
      // i=0 is today: dayStart + (DAYS_WINDOW-1-i) days.
      const day = new Date(dayStart);
      day.setDate(day.getDate() + (DAYS_WINDOW - 1 - i));
      const label = bucketLabel(day);
      return {
        date: label,
        posts: tables.posts.get(label) ?? 0,
        comments: tables.comments.get(label) ?? 0,
        likes: tables.likes.get(label) ?? 0,
        users: tables.users.get(label) ?? 0,
      };
    });

    const latestPosts = latestPostsRaw.map((p) => ({
      id: p.id,
      authorUsername: p.author.username,
      content: p.content,
      likesCount: p._count.likes,
      commentsCount: p._count.comments,
    }));

    const payload: AdminStatsDTO = {
      totalUsers,
      maxUsers: MAX_USERS,
      totalPosts,
      totalComments,
      bannedUsers,
      totalLikes,
      postsWithImage,
      active7d: activePostAuthors.length,
      pendingReports,
      dailyStats,
      latestPosts,
    };

    return jsonOk(payload);
  } catch (err) {
    return handleApiError(err, "admin/stats:GET");
  }
}
