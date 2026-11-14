import { Prisma } from "@prisma/client";
import { handleApiError, jsonError, jsonOk } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    const commentId = Number.parseInt(id, 10);
    if (!Number.isInteger(commentId) || commentId <= 0) {
      return jsonError("Invalid comment ID", 400);
    }

    // Same toggle shape as post like: deleteMany count, then create.
    // FK violation means the comment is gone; no existence pre-check.
    const removed = await prisma.commentLike.deleteMany({
      where: { userId: user.id, commentId },
    });
    if (removed.count > 0) {
      return jsonOk({ liked: false });
    }

    try {
      await prisma.commentLike.create({
        data: { userId: user.id, commentId },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
        return jsonError("Comment not found", 404);
      }
      throw err;
    }
    return jsonOk({ liked: true });
  } catch (err) {
    return handleApiError(err, "comments/[id]/like:POST");
  }
}
