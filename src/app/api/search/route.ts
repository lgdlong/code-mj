import { SEARCH_USER_LIMIT } from "@/lib/constants";
import { handleApiError, jsonOk } from "@/server/http";
import { mapPostToDTO, postIncludeForUser } from "@/server/post-mapper";
import { prisma } from "@/server/prisma";
import { requireSessionUser } from "@/server/session";

export async function GET(req: Request) {
  try {
    const viewer = await requireSessionUser();
    const { searchParams } = new URL(req.url);
    const raw = (searchParams.get("q") ?? "").trim().slice(0, 100);
    const filter = searchParams.get("filter") === "recent" ? "recent" : "top";
    if (!raw) {
      return jsonOk({ users: [], posts: [] });
    }
    const isUsernameOnly = raw.startsWith("@");
    const term = isUsernameOnly ? raw.slice(1).trim() : raw;
    if (!term) {
      return jsonOk({ users: [], posts: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        banned: false,
        ...(isUsernameOnly
          ? { username: { contains: term, mode: "insensitive" } }
          : {
              OR: [
                { username: { contains: term, mode: "insensitive" } },
                { name: { contains: term, mode: "insensitive" } },
              ],
            }),
      },
      take: SEARCH_USER_LIMIT,
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        role: true,
        banned: true,
        _count: { select: { followers: true } },
        followers: {
          where: { followerId: viewer.id },
          select: { followerId: true },
        },
      },
    });

    const orderBy =
      filter === "top"
        ? [{ likes: { _count: "desc" as const } }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

    const posts = isUsernameOnly
      ? await prisma.post.findMany({
          where: {
            author: {
              banned: false,
              username: { contains: term, mode: "insensitive" },
            },
          },
          orderBy,
          take: 30,
          include: postIncludeForUser(viewer.id),
        })
      : await prisma.post.findMany({
          where: {
            author: { banned: false },
            OR: [
              { content: { contains: term, mode: "insensitive" } },
              { author: { username: { contains: term, mode: "insensitive" } } },
            ],
          },
          orderBy,
          take: 30,
          include: postIncludeForUser(viewer.id),
        });
    return jsonOk({
      users: users.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        image: u.image,
        bio: u.bio,
        role: u.role === "admin" ? ("admin" as const) : ("user" as const),
        banned: u.banned,
        followersCount: u._count.followers,
        isFollowing: u.followers.length > 0,
      })),
      posts: posts.map(mapPostToDTO),
    });
  } catch (err) {
    return handleApiError(err, "search:GET");
  }
}
