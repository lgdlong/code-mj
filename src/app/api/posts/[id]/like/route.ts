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

    const postExists = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!postExists) return jsonError("Post not found", 404);

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: user.id, postId } },
    });

    if (existing) {
      await prisma.like.delete({
        where: { userId_postId: { userId: user.id, postId } },
      });
      return jsonOk({ liked: false });
    }

    await prisma.like.create({
      data: { userId: user.id, postId },
    });
    return jsonOk({ liked: true });
  } catch (err) {
    return handleApiError(err, "posts/[id]/like:POST");
  }
}
