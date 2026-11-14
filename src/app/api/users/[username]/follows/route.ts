import { FOLLOW_PAGE_SIZE } from "@/lib/constants";
import { handleApiError, jsonError, jsonOk } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";
import type { LikerDTO } from "@/types/domain";

/** Cursor is `${createdAt.toISOString()}|${userId}`, matching the (createdAt desc, userId desc) order. */
function parseCursor(raw: string | null): { at: Date; userId: string } | null {
  if (!raw) return null;
  const separator = raw.indexOf("|");
  if (separator <= 0) return null;
  const at = new Date(raw.slice(0, separator));
  const userId = raw.slice(separator + 1);
  if (!userId || Number.isNaN(at.getTime())) return null;
  return { at, userId };
}

export async function GET(
  req: Request,
  context: { params: Promise<{ username: string }> }
) {
  try {
    await requireSessionUser();
    const { username: rawUsername } = await context.params;
    const username = decodeURIComponent(rawUsername).toLowerCase();

    const target = await prisma.user.findUnique({
      where: { username },
      select: { id: true, banned: true },
    });
    if (!target || target.banned) return jsonError("User not found", 404);

    const { searchParams } = new URL(req.url);
    const kind = searchParams.get("kind");
    if (kind !== "followers" && kind !== "following") {
      return jsonError("Invalid kind", 400);
    }
    const cursor = parseCursor(searchParams.get("cursor"));

    // kind=followers: rows where followingId = target, `follower` is the list user.
    // kind=following: rows where followerId = target, `following` is the list user.
    // Two explicit queries instead of a computed key — Prisma narrows the row
    // shape per branch, the ternary path types the list user as never.
    const relationWhere = kind === "followers" ? { followingId: target.id } : { followerId: target.id };
    const tiebreakKey = kind === "followers" ? "followerId" : "followingId";
    const relationUserKey = kind === "followers" ? "follower" : "following";

    const rows = await prisma.follow.findMany({
      where: {
        ...relationWhere,
        [relationUserKey]: { banned: false },
        ...(cursor && {
          OR: [
            { createdAt: { lt: cursor.at } },
            { createdAt: cursor.at, [tiebreakKey]: { lt: cursor.userId } },
          ],
        }),
      },
      orderBy: [{ createdAt: "desc" }, { [tiebreakKey]: "desc" as "followerId" | "followingId" }],
      take: FOLLOW_PAGE_SIZE + 1,
      select: {
        followerId: true,
        followingId: true,
        createdAt: true,
        follower: { select: { id: true, username: true, name: true, image: true, role: true } },
        following: { select: { id: true, username: true, name: true, image: true, role: true } },
      },
    });

    const hasMore = rows.length > FOLLOW_PAGE_SIZE;
    const page = hasMore ? rows.slice(0, FOLLOW_PAGE_SIZE) : rows;
    const items: LikerDTO[] = page.map((row) => {
      const user = row[relationUserKey as "follower" | "following"];
      return {
        id: user.id,
        username: user.username,
        name: user.name,
        image: user.image,
        role: user.role === "admin" ? ("admin" as const) : ("user" as const),
        createdAt: row.createdAt.toISOString(),
      };
    });
    const last = page[page.length - 1];
    const lastUserId = last ? (kind === "followers" ? last.followerId : last.followingId) : "";
    const nextCursor =
      hasMore && last ? `${last.createdAt.toISOString()}|${lastUserId}` : null;

    return jsonOk({ items, nextCursor });
  } catch (err) {
    return handleApiError(err, "users/[username]/follows:GET");
  }
}
