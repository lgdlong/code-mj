import { handleApiError, jsonOk } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireAdminUser } from "@/server/session";

export async function GET() {
  try {
    await requireAdminUser();
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        author: { select: { username: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return jsonOk(
      posts.map((p) => ({
        id: p.id,
        username: p.author.username,
        content: p.content,
        imageUrls: p.imageUrls,
        likes: p._count.likes,
        comments: p._count.comments,
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    return handleApiError(err, "admin/posts:GET");
  }
}
