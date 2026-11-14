import { handleApiError, jsonError, jsonOk, parsePostId } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";
import { LIKERS_PAGE_SIZE } from "@/lib/constants";
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireSessionUser();
    const { id } = await context.params;
    const postId = parsePostId(id);
    if (!postId) return jsonError("Invalid post ID", 400);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) return jsonError("Post not found", 404);

    const cursor = parseCursor(new URL(req.url).searchParams.get("cursor"));
    const rows = await prisma.like.findMany({
      where: {
        postId,
        user: { banned: false },
        ...(cursor && {
          OR: [
            { createdAt: { lt: cursor.at } },
            { createdAt: cursor.at, userId: { lt: cursor.userId } },
          ],
        }),
      },
      orderBy: [{ createdAt: "desc" }, { userId: "desc" }],
      take: LIKERS_PAGE_SIZE + 1,
      select: {
        userId: true,
        createdAt: true,
        user: { select: { username: true, name: true, image: true, role: true } },
      },
    });

    const hasMore = rows.length > LIKERS_PAGE_SIZE;
    const page = hasMore ? rows.slice(0, LIKERS_PAGE_SIZE) : rows;
    const items: LikerDTO[] = page.map((row) => ({
      id: row.userId,
      username: row.user.username,
      name: row.user.name,
      image: row.user.image,
      role: row.user.role === "admin" ? "admin" : "user",
      createdAt: row.createdAt.toISOString(),
    }));
    const last = page[page.length - 1];
    const nextCursor =
      hasMore && last ? `${last.createdAt.toISOString()}|${last.userId}` : null;

    return jsonOk({ items, nextCursor });
  } catch (err) {
    return handleApiError(err, "posts/[id]/likes:GET");
  }
}
