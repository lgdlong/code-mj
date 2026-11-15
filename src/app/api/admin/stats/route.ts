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

    // 5-day buckets in one round trip instead of four findMany + JS folding. Day buckets are
    // formatted in SQL (UTC, matching how Prisma stores timestamps) so no timezone drifts in.
    const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    dayStart.setUTCDate(dayStart.getUTCDate() - (DAYS_WINDOW - 1));

    const bucketLabel = (d: Date) =>
      `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

    const dayRows = await prisma.$queryRaw<Array<{ table: string; label: string; count: bigint }>>`
      SELECT src AS "table", to_char(date_trunc('day', at), 'DD/MM') AS label, count(*) AS count
      FROM (
        SELECT 'posts' AS src, "createdAt" AS at FROM "post" WHERE "createdAt" >= ${dayStart}
        UNION ALL SELECT 'comments', "createdAt" FROM "comment" WHERE "createdAt" >= ${dayStart}
        UNION ALL SELECT 'likes', "createdAt" FROM "like" WHERE "createdAt" >= ${dayStart}
        UNION ALL SELECT 'users', "createdAt" FROM "user" WHERE "createdAt" >= ${dayStart}
      ) s
      GROUP BY 1, 2
    `;

    const counts = new Map<string, number>();
    for (const row of dayRows) {
      counts.set(`${row.table}:${row.label}`, Number(row.count));
    }

    const dailyStats: AdminDailyStatDTO[] = Array.from({ length: DAYS_WINDOW }, (_, i) => {
      // i=0 is today: dayStart + (DAYS_WINDOW-1-i) days.
      const day = new Date(dayStart);
      day.setUTCDate(day.getUTCDate() + (DAYS_WINDOW - 1 - i));
      const label = bucketLabel(day);
      return {
        date: label,
        posts: counts.get(`posts:${label}`) ?? 0,
        comments: counts.get(`comments:${label}`) ?? 0,
        likes: counts.get(`likes:${label}`) ?? 0,
        users: counts.get(`users:${label}`) ?? 0,
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
