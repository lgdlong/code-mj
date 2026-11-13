import { handleApiError, jsonError, jsonOk } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";

export async function POST(
  _req: Request,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const viewer = await requireSessionUser();
    const { username } = await context.params;
    const target = await prisma.user.findUnique({
      where: { username: decodeURIComponent(username) },
      select: { id: true, banned: true },
    });
    if (!target || target.banned) return jsonError("User not found", 404);
    if (target.id === viewer.id) return jsonError("Cannot follow yourself", 400);

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: viewer.id, followingId: target.id },
      },
    });

    if (existing) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: { followerId: viewer.id, followingId: target.id },
        },
      });
      return jsonOk({ following: false });
    }

    await prisma.follow.create({
      data: { followerId: viewer.id, followingId: target.id },
    });
    return jsonOk({ following: true });
  } catch (err) {
    return handleApiError(err, "users/[username]/follow:POST");
  }
}
