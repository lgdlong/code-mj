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

    const exists = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });
    if (!exists) return jsonError("Comment not found", 404);

    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId: user.id, commentId } },
    });

    if (existing) {
      await prisma.commentLike.delete({
        where: { userId_commentId: { userId: user.id, commentId } },
      });
      return jsonOk({ liked: false });
    }

    await prisma.commentLike.create({
      data: { userId: user.id, commentId },
    });
    return jsonOk({ liked: true });
  } catch (err) {
    return handleApiError(err, "comments/[id]/like:POST");
  }
}
