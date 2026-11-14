import { MENTION_SUGGEST_LIMIT, MAX_USERNAME_LENGTH } from "@/lib/constants";
import { handleApiError, jsonOk } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";
import type { LikerDTO } from "@/types/domain";

export async function GET(req: Request) {
  try {
    const viewer = await requireSessionUser();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").toLowerCase().slice(0, MAX_USERNAME_LENGTH);

    // Followed users only, prefix match on the unique username index.
    const rows = await prisma.follow.findMany({
      where: {
        followerId: viewer.id,
        following: { banned: false, ...(q ? { username: { startsWith: q } } : {}) },
      },
      orderBy: [{ createdAt: "desc" }, { followingId: "desc" }],
      take: MENTION_SUGGEST_LIMIT,
      select: {
        createdAt: true,
        following: { select: { id: true, username: true, name: true, image: true, role: true } },
      },
    });

    const items: LikerDTO[] = rows.map((row) => ({
      id: row.following.id,
      username: row.following.username,
      name: row.following.name,
      image: row.following.image,
      role: row.following.role === "admin" ? "admin" : "user",
      createdAt: row.createdAt.toISOString(),
    }));

    return jsonOk({ items, nextCursor: null });
  } catch (err) {
    return handleApiError(err, "mentions/suggest:GET");
  }
}
