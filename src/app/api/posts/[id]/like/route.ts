import { Prisma } from "@prisma/client";
import { handleApiError, jsonError, jsonOk, parsePostId } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    const postId = parsePostId(id);
    if (!postId) return jsonError("Invalid post ID", 400);

    // FK violation means the post is gone; no existence pre-check round trip.
    // Toggle via deleteMany's count: no read-before-write, no races on double-tap.
    const removed = await prisma.like.deleteMany({
      where: { userId: user.id, postId },
    });
    if (removed.count > 0) {
      return jsonOk({ liked: false });
    }

    try {
      await prisma.like.create({
        data: { userId: user.id, postId },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
        return jsonError("Post not found", 404);
      }
      throw err;
    }
    return jsonOk({ liked: true });
  } catch (err) {
    return handleApiError(err, "posts/[id]/like:POST");
  }
}
