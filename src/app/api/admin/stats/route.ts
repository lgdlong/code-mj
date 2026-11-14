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
      topPostsRaw,
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
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { username: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
    ]);

    const dailyStats: AdminDailyStatDTO[] = [];
    for (let i = 0; i < DAYS_WINDOW; i++) {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const [posts, comments, likes, users] = await Promise.all([
        prisma.post.count({ where: { createdAt: { gte: start, lt: end } } }),
        prisma.comment.count({ where: { createdAt: { gte: start, lt: end } } }),
        prisma.like.count({ where: { createdAt: { gte: start, lt: end } } }),
        prisma.user.count({ where: { createdAt: { gte: start, lt: end } } }),
      ]);

      const label = `${String(start.getDate()).padStart(2, "0")}/${String(
        start.getMonth() + 1
      ).padStart(2, "0")}`;
      dailyStats.push({ date: label, posts, comments, likes, users });
    }

    const topPosts = topPostsRaw
      .map((p) => ({
        id: p.id,
        authorUsername: p.author.username,
        content: p.content,
        likesCount: p._count.likes,
        commentsCount: p._count.comments,
      }))
      .sort(
        (a, b) =>
          b.likesCount + b.commentsCount - (a.likesCount + a.commentsCount)
      )
      .slice(0, 3);

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
      topPosts,
    };

    return jsonOk(payload);
  } catch (err) {
    return handleApiError(err, "admin/stats:GET");
  }
}
