import { handleApiError, jsonOk } from "@/server/http";
import { prisma } from "@/server/prisma";
import { requireAdminUser } from "@/server/session";

export async function GET() {
  try {
    await requireAdminUser();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        banned: true,
        _count: { select: { posts: true } },
      },
    });

    return jsonOk(
      users.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        role: u.role === "admin" ? "admin" : "user",
        banned: u.banned,
        postsCount: u._count.posts,
      }))
    );
  } catch (err) {
    return handleApiError(err, "admin/users:GET");
  }
}
