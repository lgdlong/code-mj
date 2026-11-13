import { handleApiError, jsonOk } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireAdminUser } from "@/server/session";

export async function GET() {
  try {
    await requireAdminUser();
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        author: { select: { username: true } },
        post: { select: { id: true, content: true } },
      },
    });

    return jsonOk(
      comments.map((c) => ({
        id: c.id,
        postId: c.postId,
        postExcerpt: c.post.content.slice(0, 36),
        username: c.author.username,
        content: c.content,
        tier: c.parentId ? 2 : 1,
        createdAt: c.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    return handleApiError(err, "admin/comments:GET");
  }
}
